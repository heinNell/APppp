# Step-by-Step Implementation Commands

Follow these exact steps to implement the webhook fix solution:

## 1. Update the Cloud Function Implementation

First, let's update the `functions/src/index.ts` file to use the enhanced webhook implementation:

```bash
# Navigate to the functions directory
cd functions

# Create a backup of the original index.ts
cp src/index.ts src/index.ts.backup

# Update the index.ts file to import and use the enhanced implementation
```

The exact code change to make in `functions/src/index.ts`:

```typescript
// Import the enhanced webhook implementation at the top of the file
import { enhancedDriverBehaviorWebhook } from './enhanced-driver-behavior-webhook';

// Comment out or remove the existing importDriverBehaviorWebhook function
// Look for this block and comment it out:
/*
export const importDriverBehaviorWebhook = onRequest(async (req, res) => {
    // ... existing implementation ...
});
*/

// Add this line after the imports at the top of the file
export { enhancedDriverBehaviorWebhook as importDriverBehaviorWebhook };
```

## 2. Deploy the Updated Cloud Function

```bash
# Ensure you're in the functions directory
cd functions

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Deploy only the importDriverBehaviorWebhook function
firebase deploy --only functions:importDriverBehaviorWebhook

# To verify the deployment, check the function URL
firebase functions:list
```

After deployment, you should see a message with the function URL, which should look like:
`https://us-central1-mat1-9e6b3.cloudfunctions.net/importDriverBehaviorWebhook`

## 3. Test the Webhook with the Improved Test Script

```bash
# Navigate back to the project root
cd ..

# Install the node-fetch dependency
npm install --save-dev node-fetch

# Set the environment to development to prevent production testing
export NODE_ENV=development

# Run the test script with valid payloads
node improved-driver-behavior-webhook-test.js
```

## 4. Update the Google Apps Script (if needed)

If you need to update the Google Apps Script:

1. Open the Google Apps Script editor at [https://script.google.com](https://script.google.com)
2. Find and open your Driver Behavior import script
3. Locate the function that prepares the payload (likely `postDriverBehaviorToFirebase`)
4. Ensure the payload is structured correctly:

```javascript
// Find this section in the Google Apps Script
const payload = JSON.stringify({ 
  events: eventsToPost,
  meta: {
    source: "google_sheet",
    timestamp: new Date().toISOString(),
    count: eventsToPost.length,
    targetCollection: COLLECTION_NAME
  }
});
```

5. Save the script and run a test import

## 5. Verify the Fix Works in Production

```bash
# Test the production webhook with a single valid event
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"events":[{"fleetNumber":"TEST-123","eventType":"harsh_braking","eventTime":"2025-07-01T08:00:00.000Z"}]}' \
  https://us-central1-mat1-9e6b3.cloudfunctions.net/importDriverBehaviorWebhook

# Check the Cloud Function logs
firebase functions:log --only importDriverBehaviorWebhook
```

## 6. Monitor for Any New Errors

After deploying, monitor the Cloud Function logs for any new errors:

```bash
# Stream logs in real-time
firebase functions:log --only importDriverBehaviorWebhook --stream
```

## Troubleshooting Common Issues

### If deployment fails:

```bash
# Check for TypeScript errors
npm run build

# Deploy with debugging enabled
firebase deploy --only functions:importDriverBehaviorWebhook --debug
```

### If the function returns 500 errors:

```bash
# Check the detailed logs
firebase functions:log --only importDriverBehaviorWebhook
```

### If the function is not receiving events:

```bash
# Verify the function URL
firebase functions:list

# Test with curl to see the exact response
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{"events":[{"fleetNumber":"TEST-123","eventType":"harsh_braking","eventTime":"2025-07-01T08:00:00.000Z"}]}' \
  https://us-central1-mat1-9e6b3.cloudfunctions.net/importDriverBehaviorWebhook
```

## Rollback Plan (if needed)

If something goes wrong and you need to rollback:

```bash
# Restore the original index.ts
cd functions
cp src/index.ts.backup src/index.ts

# Redeploy the original function
npm run build
firebase deploy --only functions:importDriverBehaviorWebhook