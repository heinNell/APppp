# Fix for importDriverBehaviorWebhook Invalid Payload Structure Error

## Problem Description

The Cloud Function `importDriverBehaviorWebhook` is reporting an "Invalid payload structure" error, indicating that the data sent to the function does not match its expected format. This error appears in Google Cloud Logging with details about the Cloud Run service.

## Root Cause Analysis

After investigating the codebase, we've identified several potential causes for this error:

### 1. Incorrect Webhook Trigger

The Cloud Function expects a specific JSON payload with an `events` array, but it may be receiving Cloud Storage object metadata instead. This suggests a possible confusion between different trigger types:

- The webhook function (`importDriverBehaviorWebhook`) expects POST requests with a specific JSON structure
- The Cloud Storage function (`importDriverBehaviorFromFile`) expects Cloud Storage events

### 2. Test Script Execution in Production

The repository contains a test script (`test-driver-behavior-webhook.js`) that intentionally sends invalid payloads to test error handling:

```javascript
await sendDriverBehaviorEvent({
  data: "This payload is missing the events array"
}, "No Events Array (Should Fail Validation)");
```

If this test script was executed against the production endpoint, it would generate the observed error.

### 3. Data Format Mismatch

There's a discrepancy between:
- The CSV file format: `driverId,timestamp,eventType,speed_kmh,location_geopoint`
- The Google Apps Script expected headers: `"Fleet Number", "Driver Name", "Event Type", "Event Time", etc.`

This mismatch could cause improperly formatted data to be sent to the webhook.

### 4. Cloud Function Deployment Issue

The error includes: "Error: User code failed to load. Cannot determine backend specification. Timeout after 10000." This suggests a potential deployment problem with the Cloud Function itself.

## Solutions

### 1. Fix the Webhook Payload Structure

Ensure all clients sending data to the webhook use the correct payload format:

```javascript
// Correct payload structure
{
  "events": [
    {
      "fleetNumber": "28H",
      "eventType": "harsh_braking",
      "eventTime": "2025-06-29T13:15:30.000Z",
      "driverName": "John Doe",
      // Other optional fields
    }
    // Additional events...
  ],
  "meta": {
    "source": "google_sheet",
    "timestamp": "2025-06-29T13:15:30.000Z",
    "count": 1
  }
}
```

### 2. Update the Google Apps Script

Ensure the Google Apps Script correctly maps the CSV columns to the expected field names:

1. Open the Google Apps Script editor
2. Verify the sheet column mappings match the actual data
3. Update the field transformation logic to match these requirements:
   - `driverId` → `fleetNumber` (or include both)
   - `timestamp` → `eventTime`
   - `eventType` should be properly formatted
   - Add default values for required fields if missing

### 3. Ensure Proper Trigger Type

Verify that the Cloud Function is set up with the correct trigger type:

1. Go to the Firebase Console or Google Cloud Console
2. Navigate to Cloud Functions
3. Check the trigger configuration for `importDriverBehaviorWebhook`
4. Ensure it's configured as an HTTP trigger, not a Cloud Storage trigger
5. Verify the function URL is correctly used in all clients

### 4. Resolve Deployment Issues

If the function is failing to load:

1. Check the Cloud Function logs for specific deployment errors
2. Verify dependencies in `package.json` are correct
3. Ensure the function has appropriate memory and timeout settings
4. Try redeploying the function with:

```bash
cd functions
npm install
firebase deploy --only functions:importDriverBehaviorWebhook
```

### 5. Prevent Test Scripts from Running in Production

1. Update test scripts to use a test environment URL instead of production
2. Add environment checks to prevent accidental production testing:

```javascript
const DRIVER_BEHAVIOR_WEBHOOK_URL = process.env.NODE_ENV === 'production'
  ? 'https://us-central1-mat1-9e6b3.cloudfunctions.net/importDriverBehaviorWebhook'
  : 'https://test-environment-url/importDriverBehaviorWebhook';
```

## Verification Steps

After implementing the fixes:

1. Test the webhook with a properly formatted payload:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"events":[{"fleetNumber":"28H","eventType":"harsh_braking","eventTime":"2025-06-29T13:15:30.000Z"}]}' \
     https://us-central1-mat1-9e6b3.cloudfunctions.net/importDriverBehaviorWebhook
   ```

2. Verify in Firestore that the event was successfully imported

3. Check Cloud Function logs to ensure no more "Invalid payload structure" errors appear

## Long-term Improvements

1. **Add Payload Validation Logging**: Enhance the Cloud Function to log the exact received payload structure when validation fails

2. **Create a Test Environment**: Set up a separate testing environment to avoid impacting production

3. **Add Schema Validation**: Implement JSON schema validation in the Cloud Function to provide more detailed error messages

4. **Implement Webhook Versioning**: Add API versioning to support gradual changes to payload structures

5. **Improve Error Handling**: Update the webhook to provide more detailed error responses with specific validation failures