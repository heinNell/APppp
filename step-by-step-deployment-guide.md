# Step-by-Step Deployment Guide

This guide provides detailed instructions for deploying the enhanced webhook implementation to fix the "Invalid payload structure" error.

## Prerequisites

1. Ensure you have the Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Authenticate with Firebase (without sharing credentials):
   ```bash
   firebase login
   ```

3. Make sure you're in the project directory:
   ```bash
   cd /path/to/your/project
   ```

## Deployment Steps

### 1. Backup the Current Implementation

```bash
# Navigate to the functions directory
cd functions

# Create a backup of the current implementation
cp src/index.ts src/index.ts.backup.$(date +%Y%m%d%H%M%S)
```

### 2. Ensure the Enhanced Webhook File is in Place

Make sure `functions/src/enhanced-driver-behavior-webhook.ts` exists with the enhanced implementation we created.

### 3. Update the Main Functions File

The `functions/src/index.ts` file should be updated to import and use the enhanced implementation:

```bash
# Navigate back to the project root if needed
cd ..

# Verify that the index.ts file has been updated
cat functions/src/index.ts | grep "enhancedDriverBehaviorWebhook"
```

You should see lines that import and export the enhanced implementation:
```typescript
import { enhancedDriverBehaviorWebhook } from './enhanced-driver-behavior-webhook';
export { enhancedDriverBehaviorWebhook as importDriverBehaviorWebhook };
```

### 4. Install Dependencies

```bash
# Navigate to the functions directory
cd functions

# Install dependencies
npm install
```

### 5. Build the TypeScript Code

```bash
# Build the TypeScript code
npm run build
```

### 6. Deploy the Function

```bash
# Deploy only the importDriverBehaviorWebhook function
firebase deploy --only functions:importDriverBehaviorWebhook
```

### 7. Verify the Deployment

```bash
# List all deployed functions
firebase functions:list
```

Look for `importDriverBehaviorWebhook` in the output with status "ACTIVE".

## Testing the Deployed Function

### 1. Test with the Improved Test Script

```bash
# Navigate back to the project root
cd ..

# Set environment to development
export NODE_ENV=development

# Run the test script
node improved-driver-behavior-webhook-test.js
```

### 2. Check the Function Logs

```bash
# Stream the function logs
firebase functions:log --only importDriverBehaviorWebhook
```

### 3. Test with curl

```bash
# Send a test payload to the webhook
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"events":[{"fleetNumber":"TEST-123","eventType":"harsh_braking","eventTime":"2025-07-01T08:00:00.000Z"}]}' \
  https://us-central1-mat1-9e6b3.cloudfunctions.net/importDriverBehaviorWebhook
```

## Troubleshooting Common Issues

### Deployment Fails with Authentication Errors

If you see authentication errors:

```bash
# Re-authenticate with Firebase
firebase logout
firebase login
```

### TypeScript Build Errors

If the build fails with TypeScript errors:

```bash
# Check the specific errors
npm run build -- --verbose

# Fix any issues in the code files
```

### Function Execution Errors

If the function is deployed but returns errors:

```bash
# Check the detailed logs
firebase functions:log --only importDriverBehaviorWebhook
```

### Rolling Back (If Needed)

If you need to roll back to the previous implementation:

```bash
# Navigate to the functions directory
cd functions

# List available backups
ls -la src/index.ts.backup.*

# Restore from a specific backup
cp src/index.ts.backup.YYYYMMDDHHMMSS src/index.ts

# Rebuild and redeploy
npm run build
firebase deploy --only functions:importDriverBehaviorWebhook
```

## Security Best Practices

1. **Never share or commit credentials**: Use environment variables or Firebase secret management.

2. **Secure your service account keys**: Restrict access to only necessary services.

3. **Use the principle of least privilege**: Grant only the permissions needed.

4. **Rotate credentials regularly**: Set up a schedule for rotating all keys.

5. **Monitor your project**: Check Cloud audit logs for unauthorized access.

6. **Restrict function access**: Use Firebase security rules to limit access.

7. **Validate all inputs**: Always validate webhook payloads.

## Next Steps

After successful deployment:

1. Monitor the Cloud Function logs for any errors
2. Update Google Apps Script if needed to ensure proper payload format
3. Verify that driver behavior events are appearing in Firestore
4. Check that the events are visible in the UI

If you encounter any issues or have questions about the deployment process, feel free to ask!