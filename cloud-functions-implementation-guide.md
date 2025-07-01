# Cloud Functions Implementation Guide

This guide explains the Cloud Functions implementation for fixing the "Invalid payload structure" error in the `importDriverBehaviorWebhook` function. It covers the enhanced webhook implementation, integration with the main functions file, and deployment process.

## 1. Enhanced Webhook Implementation

The enhanced webhook implementation is in `functions/src/enhanced-driver-behavior-webhook.ts`. Here's a breakdown of its key components:

### Payload Validation Logic

The enhanced webhook validates payloads in multiple ways:

```typescript
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

// Check for events array
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

// Validate events is an array
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
```

### Event Processing Logic

Once the payload is validated, each event is processed:

```typescript
// Process each event with validation
for (const event of events) {
    // Required field validation with detailed reporting
    const requiredFields = ['fleetNumber', 'eventType', 'eventTime'];
    const missingFields = requiredFields.filter(field => !event[field]);
    
    if (missingFields.length > 0) {
        // Log validation errors but continue processing other events
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
        // Ensure consistent string types
        fleetNumber: String(event.fleetNumber),
        eventType: String(event.eventType),
        // Convert dates to ISO format
        eventTime: event.eventTime instanceof Date 
            ? event.eventTime.toISOString() 
            : String(event.eventTime),
        // Add metadata
        processedAt: timestamp,
        importSource: event.importSource || req.headers['x-source'] || 'webhook',
    };
    
    // Check for duplicates and store to Firestore
    // ...
}
```

### Error Handling and Response

The function includes comprehensive error handling:

```typescript
try {
    // Processing logic...
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
```

## 2. Integration with Main Functions File

The enhanced webhook is integrated into the main `functions/src/index.ts` file as follows:

### Import the Enhanced Implementation

```typescript
import { enhancedDriverBehaviorWebhook } from './enhanced-driver-behavior-webhook';
```

### Export as the Main Webhook Function

```typescript
// Use the enhanced implementation for the importDriverBehaviorWebhook function
export { enhancedDriverBehaviorWebhook as importDriverBehaviorWebhook };
```

### Keep Original Implementation as Reference

```typescript
/* Original implementation (commented out for reference)
export const importDriverBehaviorWebhook = onRequest(async (req, res) => {
    // ... original code ...
});
*/
```

## 3. Deployment Process

### Using the Deployment Script

The easiest way to deploy is using the provided script:

```bash
# Make the script executable
chmod +x deploy-webhook-fix.sh

# Run the script
./deploy-webhook-fix.sh
```

### Manual Deployment Steps

If you prefer to deploy manually:

1. Make a backup of the current implementation:
   ```bash
   cd functions
   cp src/index.ts src/index.ts.backup.$(date +%Y%m%d%H%M%S)
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

4. Deploy only the affected function:
   ```bash
   firebase deploy --only functions:importDriverBehaviorWebhook
   ```

## 4. Verification and Testing

### Verify Deployment

Check that the function is properly deployed:

```bash
firebase functions:list
```

Look for `importDriverBehaviorWebhook` in the output with the correct URL.

### Test with Valid Payload

Use the improved test script to send a valid payload:

```bash
# Set environment to development
export NODE_ENV=development

# Run the test script
node improved-driver-behavior-webhook-test.js
```

### Check Function Logs

Monitor the function logs to see if it's working correctly:

```bash
firebase functions:log --only importDriverBehaviorWebhook
```

Look for logs that indicate successful processing of events.

### Test with curl

You can also test with curl directly:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"events":[{"fleetNumber":"TEST-123","eventType":"harsh_braking","eventTime":"2025-07-01T08:00:00.000Z"}]}' \
  https://us-central1-mat1-9e6b3.cloudfunctions.net/importDriverBehaviorWebhook
```

## 5. Troubleshooting

### Deployment Errors

If deployment fails:

```bash
# Check for TypeScript errors
npm run build

# Deploy with debugging enabled
firebase deploy --only functions:importDriverBehaviorWebhook --debug
```

### Function Errors

If the function returns errors:

```bash
# Check detailed logs
firebase functions:log --only importDriverBehaviorWebhook
```

### Rollback if Needed

If you need to rollback:

```bash
# Restore from backup
cp src/index.ts.backup.YYYYMMDDHHMMSS src/index.ts

# Redeploy
npm run build
firebase deploy --only functions:importDriverBehaviorWebhook
```

## 6. Best Practices for Future Function Development

- Always validate incoming payloads
- Provide detailed error messages
- Use type safety with TypeScript
- Include comprehensive logging
- Handle edge cases gracefully
- Test with different payload types
- Add environment-specific configurations