import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// ================================================================
// NEW TELEMATICS SYSTEM (Refactored from Express)
// ================================================================

// 1. Configuration
// In a real project, use Firebase environment configuration:
// firebase functions:config:set telematics.safety_score_base="100"
const telematicsConfig = {
    SAFETY_SCORE_BASE: 100,
    PENALTY_SPEEDING: 10,
    PENALTY_HARSH_BRAKING: 5,
    PENALTY_RAPID_ACCELERATION: 5,
    PENALTY_SHARP_CORNERING: 3,
    SPEEDING_THRESHOLD_MPH: 80,
    HARSH_BRAKING_G_FORCE_THRESHOLD: 0.5,
};

// 2. Type Definitions
interface Location { lat: number; lon: number; }
interface DriverEvent {
  driverId: string;
  eventType: "speeding" | "harsh_braking" | "rapid_acceleration" | "sharp_cornering";
  value: number;
  timestamp: string;
  location: Location;
  vehicleId?: string;
  tripId?: string;
}

// 3. Core Logic Functions (Driver Behavior)

const logHarshEvent = async (eventData: DriverEvent) => {
    const eventRef = await db.collection("telematics_driver_events").add(eventData);
    console.log(`Logged event for driver ${eventData.driverId}:`, eventRef.id);
    return { id: eventRef.id, ...eventData };
};

const calculateDriverSafetyScore = async (driverId: string) => {
    const driverRef = db.collection("telematics_drivers").doc(driverId);
    const eventsSnapshot = await db
        .collection("telematics_driver_events")
        .where("driverId", "==", driverId)
        .get();

    let score = telematicsConfig.SAFETY_SCORE_BASE;
    const penaltyMap: { [key: string]: number } = {
        speeding: telematicsConfig.PENALTY_SPEEDING,
        harsh_braking: telematicsConfig.PENALTY_HARSH_BRAKING,
        rapid_acceleration: telematicsConfig.PENALTY_RAPID_ACCELERATION,
        sharp_cornering: telematicsConfig.PENALTY_SHARP_CORNERING,
    };

    eventsSnapshot.forEach((doc) => {
        const event = doc.data() as DriverEvent;
        if (penaltyMap[event.eventType]) {
            score -= penaltyMap[event.eventType];
        }
    });

    const finalScore = Math.max(0, score);
    await driverRef.set({ safetyScore: finalScore }, { merge: true });
    return finalScore;
};

const generateBehaviorAlert = (driverId: string, event: DriverEvent) => {
    const alert = {
        alertId: `alert_${Date.now()}`,
        driverId,
        eventType: event.eventType,
        message: `High severity event detected for driver ${driverId}: ${event.eventType} with value ${event.value}.`,
        timestamp: new Date().toISOString(),
        criticality: "high",
    };
    console.log("Generated Alert:", alert);
    // In production, this would integrate with a notification service
    return alert;
};

// 4. Core Logic Functions (Trip Management)

const haversineDistance = (coords1: Location, coords2: Location) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const startTrip = async (tripData: any) => {
    const tripRef = db.collection("telematics_trips").doc(tripData.tripId);
    const doc = await tripRef.get();
    if (doc.exists) {
        throw new Error("Trip already exists.");
    }
    const newTrip = {
        ...tripData,
        status: "in_progress",
        distanceTraveledKm: 0,
    };
    await tripRef.set(newTrip);
    // Log initial update
    await tripRef.collection("updates").add({ timestamp: tripData.startTime, location: tripData.startLocation, speed: 0 });
    console.log(`Started trip ${tripData.tripId}`);
    return newTrip;
};

const updateTripProgress = async (tripId: string, updateData: any) => {
    const tripRef = db.collection("telematics_trips").doc(tripId);
    const tripDoc = await tripRef.get();
    const trip = tripDoc.data();

    if (!trip || trip.status !== "in_progress") {
        throw new Error("Trip not found or not in progress.");
    }

    const updatesSnapshot = await tripRef.collection("updates").orderBy("timestamp", "desc").limit(1).get();
    const lastUpdate = updatesSnapshot.docs[0].data();

    const distanceIncrement = haversineDistance(lastUpdate.location, updateData.location);
    const newTotalDistance = (trip.distanceTraveledKm || 0) + distanceIncrement;

    await tripRef.update({ distanceTraveledKm: newTotalDistance });
    await tripRef.collection("updates").add(updateData);

    console.log(`Updated trip ${tripId}. Total distance: ${newTotalDistance.toFixed(2)} km.`);
    return { ...trip, distanceTraveledKm: newTotalDistance };
};

const endTrip = async (tripId: string, endData: any) => {
    const tripRef = db.collection("telematics_trips").doc(tripId);
    const tripDoc = await tripRef.get();
    const trip = tripDoc.data();

    if (!trip || trip.status !== "in_progress") {
        throw new Error("Trip not found or not in progress.");
    }

    const updatesSnapshot = await tripRef.collection("updates").get();
    const speeds = updatesSnapshot.docs.map((doc) => doc.data().speed).filter((s) => s > 0);
    const averageSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;

    const startTime = new Date(trip.startTime);
    const endTime = new Date(endData.endTime);
    const durationHours = (endTime.getTime() - startTime.getTime()) / 3600000;

    const summary = {
        totalDistanceKm: trip.distanceTraveledKm.toFixed(2),
        totalDurationHours: durationHours.toFixed(2),
        averageSpeedMph: averageSpeed.toFixed(2),
    };

    await tripRef.update({
        status: "completed",
        endTime: endData.endTime,
        endLocation: endData.endLocation,
        summary,
    });

    console.log(`Ended trip ${tripId}. Summary:`, summary);
    return { ...trip, summary };
};


// 5. New Webhook Cloud Functions

import { onRequest } from "firebase-functions/v2/https";

export const telematicsDriverEventWebhook = onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    const { driverId, eventType, value, timestamp, location, vehicleId } = req.body;

    if (!driverId || !eventType || value === undefined || !timestamp || !location) {
        res.status(400).json({ error: "Missing required fields in payload." });
        return;
    }

    try {
        const eventData: DriverEvent = { driverId, eventType, value, timestamp, location, vehicleId };
        const event = await logHarshEvent(eventData);
        const newSafetyScore = await calculateDriverSafetyScore(driverId);

        let alert = null;
        if (
            (eventType === "speeding" && value > telematicsConfig.SPEEDING_THRESHOLD_MPH) ||
            (eventType === "harsh_braking" && value > telematicsConfig.HARSH_BRAKING_G_FORCE_THRESHOLD)
        ) {
            alert = generateBehaviorAlert(driverId, event);
        }

        res.status(200).json({
            message: "Event processed successfully.",
            eventId: event.id,
            newSafetyScore,
            alert,
        });
    } catch (error: any) {
        console.error("Error processing driver event:", error);
        res.status(500).json({ error: "Internal server error.", details: error.message });
    }
});

export const telematicsTripUpdateWebhook = onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    const { tripId, status, timestamp } = req.body;

    if (!tripId || !status || !timestamp) {
        res.status(400).json({ error: "Missing required fields: tripId, status, timestamp." });
        return;
    }

    try {
        let result;
        switch (status) {
            case "trip_started":
                const { driverId, vehicleId, location } = req.body;
                result = await startTrip({ tripId, driverId, vehicleId, startTime: timestamp, startLocation: location });
                break;
            case "in_progress":
                const { location: updateLocation, speed } = req.body;
                result = await updateTripProgress(tripId, { timestamp, location: updateLocation, speed });
                break;
            case "trip_ended":
                const { location: endLocation } = req.body;
                result = await endTrip(tripId, { endTime: timestamp, endLocation });
                break;
            default:
                res.status(400).json({ error: "Invalid trip status." });
                return;
        }
        res.status(200).json({ message: `Trip status '${status}' processed successfully.`, trip: result });
    } catch (error: any) {
        console.error("Error processing trip update:", error);
        res.status(500).json({ error: "Internal server error.", details: error.message });
    }
});


// ================================================================
// EXISTING FUNCTIONS (Preserved)
// ================================================================

export const importTripsFromWebBook = onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    try {
        const { trips } = req.body;
        if (!trips || !Array.isArray(trips)) {
            res.status(400).json({ error: 'Invalid payload' });
            return;
        }
        const batch = db.batch();
        const targetCollection = 'trips';
        console.log(`[importTripsFromWebBook] Targeting collection: '${targetCollection}'`);
        let imported = 0;
        let skipped = 0;
        const promises = trips.map(async (trip: any) => {
            const { loadRef } = trip;
            if (!loadRef) {
                console.log('[importTripsFromWebBook] Skipping trip with missing loadRef.');
                skipped++;
                return;
            }
            const tripRef = db.collection(targetCollection).doc(String(loadRef));
            const doc = await tripRef.get();
            if (doc.exists) {
                skipped++;
            } else {
                batch.set(tripRef, trip);
                imported++;
            }
        });
        await Promise.all(promises);
        if (imported > 0) {
            await batch.commit();
        }
        console.log(`[importTripsFromWebBook] Import finished. Imported: ${imported}, Skipped: ${skipped}`);
        res.status(200).json({ imported, skipped, message: "Import process finished." });
    } catch (error) {
        console.error("Error importing trips:", error);
        res.status(500).send('Internal Server Error');
    }
});

export const importDriverBehaviorWebhook = onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    try {
        const { events } = req.body;
        if (!events || !Array.isArray(events)) {
            res.status(400).json({ error: 'Invalid payload' });
            return;
        }
        const batch = db.batch();
        let imported = 0;
        let skipped = 0;
        for (const event of events) {
            const { fleetNumber, eventType, eventTime } = event;
            const uniqueKey = `${fleetNumber}_${eventType}_${eventTime}`;
            const eventRef = db.collection('driverBehaviorEvents').doc(uniqueKey);
            const doc = await eventRef.get();
            if (doc.exists) {
                skipped++;
            } else {
                batch.set(eventRef, event);
                imported++;
            }
        }
        await batch.commit();
        res.status(200).json({ imported, skipped });
    } catch (error) {
        console.error("Error importing driver behavior events:", error);
        res.status(500).send('Internal Server Error');
    }
});

export const importTripsFromFile = onObjectFinalized(async (event) => {
    console.log("Received storage event for file import:", JSON.stringify(event, null, 2));
    if (!event.data || !event.data.name || !event.data.bucket) {
        console.error("Invalid storage event received. Missing essential data.", event);
        return;
    }
    const fileBucket = event.data.bucket;
    const filePath = event.data.name;
    const contentType = event.data.contentType;
    if (!contentType || !contentType.startsWith("application/json")) {
        console.log("This is not a JSON file.");
        return;
    }
    if (!filePath || !filePath.startsWith("imports/trips_")) {
        console.log(`File ${filePath} is not a trips import file.`);
        return;
    }
    const bucket = admin.storage().bucket(fileBucket);
    const file = bucket.file(filePath);
    try {
        const contents = await file.download();
        const trips = JSON.parse(contents.toString());
        if (!trips || !Array.isArray(trips)) {
            console.error("Invalid JSON payload");
            return;
        }
        const batch = db.batch();
        let imported = 0;
        let skipped = 0;
        for (const trip of trips) {
            const { loadRef } = trip;
            if (!loadRef) {
                skipped++;
                continue;
            }
            const tripRef = db.collection('Trips').doc(String(loadRef));
            const doc = await tripRef.get();
            if (doc.exists) {
                skipped++;
            } else {
                batch.set(tripRef, trip);
                imported++;
            }
        }
        if (imported > 0) {
            await batch.commit();
        }
        console.log(`Imported ${imported} trips, skipped ${skipped} trips from ${filePath}.`);
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
});

export const importDriverBehaviorFromFile = onObjectFinalized(async (event) => {
    console.log("Received storage event for driver behavior import:", JSON.stringify(event, null, 2));
    if (!event.data || !event.data.name || !event.data.bucket) {
        console.error("Invalid storage event for driver behavior. Missing essential data.", event);
        return;
    }
    const fileBucket = event.data.bucket;
    const filePath = event.data.name;
    const contentType = event.data.contentType;
    if (!contentType || !contentType.startsWith("application/json")) {
        console.log("This is not a JSON file.");
        return;
    }
    if (!filePath || !filePath.startsWith("imports/driver_behavior_")) {
        console.log(`File ${filePath} is not a driver behavior import file.`);
        return;
    }
    const bucket = admin.storage().bucket(fileBucket);
    const file = bucket.file(filePath);
    try {
        const contents = await file.download();
        const events = JSON.parse(contents.toString());
        if (!events || !Array.isArray(events)) {
            console.error("Invalid JSON payload");
            return;
        }
        const batch = db.batch();
        let imported = 0;
        let skipped = 0;
        for (const event of events) {
            const { fleetNumber, eventType, eventTime } = event;
            const uniqueKey = `${fleetNumber}_${eventType}_${eventTime}`;
            const eventRef = db.collection('driverBehaviorEvents').doc(uniqueKey);
            const doc = await eventRef.get();
            if (doc.exists) {
                skipped++;
            } else {
                batch.set(eventRef, event);
                imported++;
            }
        }
        if (imported > 0) {
            await batch.commit();
        }
        console.log(`Imported ${imported} driver behavior events, skipped ${skipped} from ${filePath}.`);
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
});

import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

export const logTripDeletion = onDocumentDeleted("trips/{tripId}", async (event) => {
    const snap = event.data;
    if (!snap) {
        console.error("No data associated with the event");
        return;
    }
    const deletedData = snap.data();
    const tripId = event.params.tripId;

    console.log(`Trip ${tripId} deleted. Logging to audit trail.`);

    const auditLog = {
        action: 'delete',
        entity: 'trip',
        entityId: tripId,
        timestamp: new Date().toISOString(),
        user: 'system', // Or retrieve user from context if available
        details: `Trip document with ID ${tripId} was deleted.`,
        changes: deletedData, // Log the entire deleted document
    };

    try {
        await db.collection('auditLogs').add(auditLog);
        console.log(`Successfully logged deletion of trip ${tripId} to audit trail.`);
    } catch (error) {
        console.error(`Failed to log deletion of trip ${tripId}:`, error);
    }
});

export const verifyRecaptcha = onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    const { token, recaptchaAction } = req.body;
    const projectID = "mat1-9e6b3";
    const recaptchaKey = "6Leyim8rAAAAAINSXyIYn8xtPeOH-7sTB2-fBcNh";

    try {
        const client = new RecaptchaEnterpriseServiceClient();
        const projectPath = client.projectPath(projectID);

        const request = {
            assessment: {
                event: {
                    token: token,
                    siteKey: recaptchaKey,
                },
            },
            parent: projectPath,
        };

        const [response] = await client.createAssessment(request);

        if (!response.tokenProperties || !response.tokenProperties.valid) {
            console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties ? response.tokenProperties.invalidReason : 'unknown'}`);
            res.status(400).json({ success: false, message: "Invalid reCAPTCHA token." });
            return;
        }

        if (response.tokenProperties.action === recaptchaAction) {
            console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
            if (response.riskAnalysis && response.riskAnalysis.score && response.riskAnalysis.score < 0.5) {
                res.status(400).json({ success: false, message: "reCAPTCHA verification failed. Low score."});
                return;
            }
            res.status(200).json({ success: true, score: response.riskAnalysis?.score });
        } else {
            console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
            res.status(400).json({ success: false, message: "reCAPTCHA action mismatch." });
        }
    } catch (error) {
        console.error("Error creating assessment:", error);
        res.status(500).json({ success: false, message: "Internal server error during reCAPTCHA verification." });
    }
});
