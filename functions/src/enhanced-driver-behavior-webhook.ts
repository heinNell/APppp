import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

// Ensure Firebase is initialized
// Note: In actual implementation, you'd check if Firebase is already initialized
try {
  admin.initializeApp();
} catch (e) {
  console.log('Firebase already initialized');
}

const db = admin.firestore();

/**
 * Enhanced Driver Behavior Webhook with improved validation and error handling
 * This is a drop-in replacement for the existing importDriverBehaviorWebhook function
 */
export const enhancedDriverBehaviorWebhook = onRequest(async (req, res) => {
    // CORS headers setup for API access
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        // Handle preflight requests
        res.set('Access-Control-Allow-Methods', 'GET, POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ 
            error: 'Method Not Allowed',
            message: 'Only POST requests are supported'
        });
        return;
    }

    console.log("[enhancedDriverBehaviorWebhook] Request headers:", JSON.stringify(req.headers, null, 2));
    
    try {
        // Enhanced payload logging
        const requestBody = req.body;
        console.log("[enhancedDriverBehaviorWebhook] Received payload:", JSON.stringify(requestBody, null, 2));
        
        // Check if the payload resembles a Cloud Storage event
        if (requestBody.name && requestBody.bucket && requestBody.contentType) {
            console.error("[enhancedDriverBehaviorWebhook] Received Cloud Storage object metadata instead of driver behavior events");
            res.status(400).json({ 
                error: 'Invalid payload structure',
                message: 'Received Cloud Storage object metadata instead of driver behavior events',
                expected: 'The webhook expects an events array, not Cloud Storage metadata',
                received: 'Cloud Storage metadata with bucket, name, and contentType'
            });
            return;
        }
        
        // Comprehensive payload validation
        if (!requestBody.events) {
            console.error("[enhancedDriverBehaviorWebhook] Missing events array in payload:", JSON.stringify(requestBody, null, 2));
            res.status(400).json({ 
                error: 'Invalid payload structure',
                message: 'Missing events array in request body',
                expected: { events: [] },
                received: requestBody
            });
            return;
        }
        
        if (!Array.isArray(requestBody.events)) {
            console.error("[enhancedDriverBehaviorWebhook] events is not an array:", typeof requestBody.events);
            res.status(400).json({ 
                error: 'Invalid payload structure',
                message: 'events property must be an array',
                expected: { events: [] },
                received: { events: requestBody.events }
            });
            return;
        }
        
        const { events } = requestBody;
        const batch = db.batch();
        const targetCollection = 'driverBehavior';
        console.log(`[enhancedDriverBehaviorWebhook] Targeting collection: '${targetCollection}'`);
        
        let imported = 0;
        let skipped = 0;
        const processingDetails = [];
        const validationErrors = [];
        
        // Process each event with validation
        for (const event of events) {
            const timestamp = new Date().toISOString();
            console.log(`[enhancedDriverBehaviorWebhook][${timestamp}] Processing event:`, JSON.stringify(event, null, 2));
            
            // Required field validation with detailed reporting
            const requiredFields = ['fleetNumber', 'eventType', 'eventTime'];
            const missingFields = requiredFields.filter(field => !event[field]);
            
            if (missingFields.length > 0) {
                const errorMsg = `Missing required fields in event: ${missingFields.join(', ')}`;
                console.error(`[enhancedDriverBehaviorWebhook] ${errorMsg}`);
                
                // Add to validation errors but continue processing other events
                validationErrors.push({
                    event,
                    missingFields,
                    message: errorMsg
                });
                
                skipped++;
                processingDetails.push({ 
                    status: 'error', 
                    reason: 'missing_required_fields', 
                    fields: missingFields,
                    event 
                });
                continue;
            }
            
            // Normalize and transform data types
            const normalizedEvent = {
                ...event,
                // Ensure consistent string types for key fields
                fleetNumber: String(event.fleetNumber),
                eventType: String(event.eventType),
                // Convert date strings to ISO format if they aren't already
                eventTime: event.eventTime instanceof Date 
                    ? event.eventTime.toISOString() 
                    : String(event.eventTime),
                // Add processing metadata
                processedAt: timestamp,
                importSource: event.importSource || req.headers['x-source'] || 'webhook',
            };
            
            // Generate a unique key for deduplication
            const { fleetNumber, eventType, eventTime } = normalizedEvent;
            const uniqueKey = `${fleetNumber}_${eventType}_${eventTime}`;
            
            // Check if this event already exists
            const eventRef = db.collection(targetCollection).doc(uniqueKey);
            const doc = await eventRef.get();
            
            if (doc.exists) {
                console.log(`[enhancedDriverBehaviorWebhook] Event already exists, skipping:`, uniqueKey);
                skipped++;
                processingDetails.push({ status: 'skipped', reason: 'already_exists', uniqueKey });
            } else {
                // Log exactly what will be written to Firestore
                console.log(`[enhancedDriverBehaviorWebhook] Writing event to Firestore:`,
                    { uniqueKey, event: JSON.stringify(normalizedEvent) });
                    
                // Add uniqueKey to the event for reference
                normalizedEvent.uniqueKey = uniqueKey;
                
                // Add to batch
                batch.set(eventRef, normalizedEvent);
                imported++;
                processingDetails.push({ status: 'imported', uniqueKey });
            }
        }
        
        // Execute batch if there are items to import
        if (imported > 0) {
            console.log(`[enhancedDriverBehaviorWebhook] Committing batch with ${imported} events`);
            await batch.commit();
            console.log(`[enhancedDriverBehaviorWebhook] Batch commit successful`);
        } else {
            console.log(`[enhancedDriverBehaviorWebhook] No events to import, skipping batch commit`);
        }
        
        // Prepare response with detailed information
        const response = {
            imported,
            skipped,
            message: `Processed ${events.length} driver behavior events. Imported: ${imported}, Skipped: ${skipped}`,
            processingDetails: processingDetails.length <= 10 
                ? processingDetails 
                : `${processingDetails.length} events processed`,
            validationErrors: validationErrors.length > 0 ? validationErrors : undefined
        };
        
        console.log(`[enhancedDriverBehaviorWebhook] Import finished:`, response);
        res.status(200).json(response);
        
    } catch (error) {
        // Enhanced error logging with detailed information
        console.error("[enhancedDriverBehaviorWebhook] Error processing request:", error);
        console.error("[enhancedDriverBehaviorWebhook] Request body:", JSON.stringify(req.body, null, 2));
        console.error("[enhancedDriverBehaviorWebhook] Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
        
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }
});

/**
 * This function provides backward compatibility with the existing webhook
 * while using the enhanced implementation
 */
export const importDriverBehaviorWebhook = enhancedDriverBehaviorWebhook;