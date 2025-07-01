# Deployment Guide: Driver Behavior Webhook Fix

This guide provides step-by-step instructions for implementing the fixes for the "Invalid payload structure" error in the `importDriverBehaviorWebhook` Cloud Function.

## Overview of Solutions

We've created the following components to fix the issue:

1. **Documentation**: `fix-driver-behavior-webhook-payload.md` - Explains the root cause and potential solutions
2. **Enhanced Webhook Function**: `functions/src/enhanced-driver-behavior-webhook.ts` - Improved Cloud Function with better validation and error handling
3. **Improved Test Script**: `improved-driver-behavior-webhook-test.js` - Safer test script with environment checks and validation

## Deployment Steps

### 1. Review the Root Cause Analysis

Before making changes, review the full analysis in `fix-driver-behavior-webhook-payload.md` to understand the issues:
- Confusion between webhook and Cloud Storage trigger functions
- Test scripts running against production
- Data format mismatches
- Potential deployment issues

### 2. Deploy the Enhanced Webhook Function

#### Option A: Replace the Existing Function

This option directly replaces the current implementation with the enhanced version:

1. Update the `functions/src/index.ts` file:

```typescript
// Add this import at the top of the file
import { enhancedDriverBehaviorWebhook } from './enhanced-driver-behavior-webhook';

// Comment out or remove the existing importDriverBehaviorWebhook function
// export const importDriverBehaviorWebhook = onRequest(async (req, res) => { ... });

// Add this line to use the enhanced implementation
export { enhancedDriverBehaviorWebhook as importDriverBehaviorWebhook };
```

2. Deploy the updated function:

```bash
cd functions
npm install
firebase deploy --only functions:importDriverBehaviorWebhook
```

#### Option B: Deploy as a New Function (Side-by-Side)

This option lets you test the new implementation without affecting the existing one:

1. Add the enhanced function to `functions/src/index.ts`:

```typescript
// Import the enhanced implementation
import { enhancedDriverBehaviorWebhook } from './enhanced-driver-behavior-webhook';

// Export it as a separate function (keep the existing one)
export { enhancedDriverBehaviorWebhook };
```

2. Deploy the new function:

```bash
cd functions
npm install
firebase deploy --only functions:enhancedDriverBehaviorWebhook
```

3. Update your clients to use the new URL after testing.

### 3. Update Google Apps Script (If Needed)

If the issue involves the Google Apps Script sending incorrect payloads:

1. Open the Google Apps Script editor
2. Navigate to the driver behavior import script
3. Update the payload structure to match the expected format:

```javascript
// Ensure this matches the structure the webhook expects
const payload = JSON.stringify({ 
  events: eventsToPost,
  meta: {
    source: "google_sheet",
    timestamp: new Date().toISOString(),
    count: eventsToPost.length
  }
});
```

4. Save and deploy the updated script

### 4. Test the Webhook with the Improved Test Script

1. Install the required dependencies:

```bash
npm install node-fetch
```

2. Set the environment to prevent accidental production testing:

```bash
export NODE_ENV=development  # Use 'staging' or 'production' as appropriate
```

3. Run the test script with valid payloads only:

```bash
node improved-driver-behavior-webhook-test.js
```

4. If you need to test invalid payloads (in development/staging only):

```bash
node improved-driver-behavior-webhook-test.js --run-invalid-tests
```

### 5. Verify the Fix

Confirm the fix is working properly:

1. Check Cloud Function logs for error messages:
   - Go to Google Cloud Console > Logging
   - Filter for `resource.type="cloud_function" AND resource.labels.function_name="importDriverBehaviorWebhook"`
   - Verify there are no more "Invalid payload structure" errors

2. Verify successful imports:
   - Check Firestore for new driver behavior events
   - Confirm they have all required fields

3. Test with the Google Apps Script:
   - Run the `testDriverBehaviorImport` function from the Apps Script editor
   - Check the logs to confirm success

## Troubleshooting

If you encounter issues after deployment:

### Function Deployment Failures

1. Check for deployment errors:

```bash
firebase deploy --only functions:importDriverBehaviorWebhook --debug
```

2. Verify the function exists in Firebase Console:
   - Go to Firebase Console > Functions
   - Confirm the function is listed and active

### Webhook Returns 500 Error

1. Check Cloud Function logs for detailed error messages
2. Verify Firestore permissions are correct
3. Ensure all required dependencies are installed

### Continued Invalid Payload Errors

1. Capture and log the exact payload being sent:
   - Add additional logging in the Google Apps Script
   - Use the test script to send a sample payload

2. Compare with the expected structure in `fix-driver-behavior-webhook-payload.md`

## Long-term Maintenance

To prevent similar issues in the future:

1. **Add Environment Separation**:
   - Create separate development, staging, and production environments
   - Use different Firebase projects for each environment

2. **Implement Continuous Integration**:
   - Add automated tests that run before deployment
   - Include payload validation tests

3. **Improve Documentation**:
   - Document the expected payload structure in a central location
   - Update all client code to reference this documentation

4. **Add Monitoring**:
   - Set up alerts for webhook failures
   - Create a dashboard to monitor webhook activity

## Contact

If you encounter any issues with this fix, please contact the development team.