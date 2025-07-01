#!/bin/bash
# Deployment script for driver behavior webhook fix

# Set error handling
set -e

echo "🔄 Starting deployment of enhanced driver behavior webhook..."

# Navigate to functions directory
cd functions

# Make a backup of current implementation
echo "📦 Creating backup of current implementation..."
cp src/index.ts src/index.ts.backup.$(date +%Y%m%d%H%M%S)

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript code
echo "🔨 Building TypeScript code..."
npm run build

# Deploy only the importDriverBehaviorWebhook function
echo "🚀 Deploying importDriverBehaviorWebhook function..."
firebase deploy --only functions:importDriverBehaviorWebhook

echo "✅ Deployment complete!"
echo "📋 Verify deployment with: firebase functions:list"
echo ""
echo "🧪 Testing the webhook:"
echo "   Use the improved-driver-behavior-webhook-test.js script to test the deployed function:"
echo "   cd .."
echo "   export NODE_ENV=development"
echo "   node improved-driver-behavior-webhook-test.js"
echo ""
echo "⚠️ Monitor logs for any issues:"
echo "   firebase functions:log --only importDriverBehaviorWebhook"