/**
 * Improved Driver Behavior Webhook Test Script
 * 
 * This script provides a safer, more robust way to test the importDriverBehaviorWebhook
 * Cloud Function with proper environment controls and validation.
 */

// Import required modules
const fetch = require('node-fetch');

// Environment Configuration
const ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = ENV === 'production';

// Webhook Configuration with environment-based URLs
const WEBHOOK_URLS = {
  development: 'http://localhost:5001/mat1-9e6b3/us-central1/importDriverBehaviorWebhook',
  staging: 'https://staging-us-central1-mat1-9e6b3.cloudfunctions.net/importDriverBehaviorWebhook',
  production: 'https://us-central1-mat1-9e6b3.cloudfunctions.net/importDriverBehaviorWebhook'
};

const DRIVER_BEHAVIOR_WEBHOOK_URL = WEBHOOK_URLS[ENV];
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// Safety warning for production tests
if (IS_PRODUCTION) {
  console.warn('\n⚠️ WARNING: YOU ARE RUNNING TESTS AGAINST PRODUCTION! ⚠️');
  console.warn('This may create test data in your production environment.');
  console.warn('Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
  
  // Add a 5-second delay to allow cancellation
  const waitUntil = Date.now() + 5000;
  while (Date.now() < waitUntil) {
    // Busy wait to allow interrupt
  }
}

// Validate webhook payload before sending
function validateWebhookPayload(payload) {
  // Check for events array
  if (!payload.events || !Array.isArray(payload.events)) {
    return {
      valid: false,
      reason: 'Payload must contain an "events" array'
    };
  }

  // Empty events array is technically valid, but likely not intentional
  if (payload.events.length === 0) {
    return {
      valid: true,
      warning: 'Events array is empty - no data will be imported'
    };
  }

  // Validate each event in the array
  const invalidEvents = [];
  
  payload.events.forEach((event, index) => {
    const requiredFields = ['fleetNumber', 'eventType', 'eventTime'];
    const missingFields = requiredFields.filter(field => !event[field]);
    
    if (missingFields.length > 0) {
      invalidEvents.push({
        index,
        reason: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
  });

  if (invalidEvents.length > 0) {
    return {
      valid: false,
      reason: 'Some events are missing required fields',
      details: invalidEvents
    };
  }

  return { valid: true };
}

// Utility Functions
async function sendDriverBehaviorEvent(payload, testName, skipValidation = false) {
  console.log(`\n📤 Running test: ${testName}`);
  console.log(`📤 Environment: ${ENV}`);
  console.log(`📤 Target endpoint: ${DRIVER_BEHAVIOR_WEBHOOK_URL}`);
  console.log('📤 Driver behavior event payload:', JSON.stringify(payload, null, 2));

  // Validate payload unless explicitly skipped
  if (!skipValidation) {
    const validation = validateWebhookPayload(payload);
    
    if (!validation.valid) {
      console.error(`❌ Invalid payload: ${validation.reason}`);
      if (validation.details) {
        console.error('Details:', validation.details);
      }
      console.error(`\nTest: ${testName} - SKIPPED (Invalid Payload) ⚠️\n`);
      return { skipped: true, reason: validation.reason };
    }
    
    if (validation.warning) {
      console.warn(`⚠️ Warning: ${validation.warning}`);
    }
  }

  try {
    // Make the request with retry logic
    const response = await retryWebhookCall(async () => {
      const res = await fetch(DRIVER_BEHAVIOR_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Test-Mode': 'true',
          'X-Environment': ENV
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
          const errorText = await res.text();
          errorMessage += `, message: ${errorText}`;
          console.error(`Error response from driver behavior webhook: ${errorText}`);
        } catch (err) {
          // If we can't read the response body, just use the status
          console.error(`Could not read error response body: ${err}`);
        }
        throw new Error(errorMessage);
      }

      return res;
    });

    // Try to parse JSON response, but handle text responses too
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { message: text };
    }

    console.log(`✅ Driver behavior event sent successfully:`, responseData);
    console.log(`\nTest: ${testName} - PASSED ✅\n`);
    return responseData;
  } catch (error) {
    console.error(`❌ Test: ${testName} - FAILED ❌`);
    console.error('Failed to send driver behavior event:', error);
    return { error: error.message };
  }
}

// Retry webhook call with exponential backoff
async function retryWebhookCall(callFn, maxRetries = MAX_RETRIES, initialDelay = INITIAL_RETRY_DELAY) {
  let lastError = null;
  let attempt = 1;
  let delay = initialDelay;

  while (attempt <= maxRetries) {
    try {
      console.log(`🔄 Webhook call attempt ${attempt}/${maxRetries}`);
      const response = await callFn();
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (attempt < maxRetries) {
        console.log(`⏱️ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        attempt++;
      } else {
        break;
      }
    }
  }

  throw lastError || new Error('All webhook call attempts failed');
}

// Helper functions for generating test data
function generateEventTime() {
  return new Date().toISOString();
}

function generateUniqueFleetNumber() {
  const fleetPrefixes = ['MT-', 'NAM-', 'ZA-'];
  const prefix = fleetPrefixes[Math.floor(Math.random() * fleetPrefixes.length)];
  const number = 1000 + Math.floor(Math.random() * 9000);
  return `${prefix}${number}`;
}

function generateEventType() {
  const eventTypes = ['harsh_braking', 'speeding', 'sharp_cornering', 'rapid_acceleration', 'sudden_stop'];
  return eventTypes[Math.floor(Math.random() * eventTypes.length)];
}

function generateBasicEvent() {
  return {
    fleetNumber: generateUniqueFleetNumber(),
    eventType: generateEventType(),
    eventTime: generateEventTime()
  };
}

function generateFullEvent() {
  const drivers = ['John Smith', 'Maria Garcia', 'David Chen', 'Emma Johnson', 'Ahmed Hassan'];
  const locations = ['Windhoek Main Road', 'Swakopmund Highway', 'Cape Town N2', 'Johannesburg M1', 'Gaborone A1'];
  const severities = ['low', 'medium', 'high', 'critical'];

  return {
    ...generateBasicEvent(),
    driverName: drivers[Math.floor(Math.random() * drivers.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    points: Math.floor(Math.random() * 10) + 1,
    description: `${generateEventType()} event detected during route`,
    location: locations[Math.floor(Math.random() * locations.length)],
    reportedAt: new Date().toISOString(),
    reportedBy: 'Telematics System',
    vehicleType: 'Heavy Truck',
    status: 'pending_review'
  };
}

// Run all tests
async function runValidTests() {
  try {
    console.log('🧪 Starting Driver Behavior Webhook Tests - VALID PAYLOADS 🧪');
    console.log('===========================================================');

    // Valid test cases
    await sendDriverBehaviorEvent({
      events: [generateBasicEvent()]
    }, "Single Valid Event");

    await sendDriverBehaviorEvent({
      events: [generateBasicEvent(), generateBasicEvent(), generateBasicEvent()]
    }, "Multiple Valid Events");

    await sendDriverBehaviorEvent({
      events: [generateFullEvent(), generateFullEvent()]
    }, "Complete Event Objects With Optional Fields");

    // Edge cases
    const duplicateEvent = generateBasicEvent();
    await sendDriverBehaviorEvent({
      events: [duplicateEvent]
    }, "First Attempt of Duplicate Event");

    // Send the exact same event again - should be skipped by webhook
    await sendDriverBehaviorEvent({
      events: [duplicateEvent]
    }, "Second Attempt of Duplicate Event (Should Skip)");

    // Empty events array test (valid but will import nothing)
    await sendDriverBehaviorEvent({
      events: []
    }, "Empty Events Array (Should Process Without Imports)");
    
    console.log('\n📊 Test Summary - VALID TESTS 📊');
    console.log('===============================');
    console.log('All valid tests completed. Check logs for details on test outcomes.');

  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run invalid tests only if explicitly requested and not in production
async function runInvalidTests() {
  if (IS_PRODUCTION) {
    console.error('❌ INVALID PAYLOAD TESTS DISABLED IN PRODUCTION ❌');
    console.error('Set NODE_ENV to "development" or "staging" to run these tests.');
    return;
  }
  
  try {
    console.log('\n🧪 Starting Driver Behavior Webhook Tests - INVALID PAYLOADS 🧪');
    console.log('=============================================================');
    console.log('⚠️ These tests are expected to fail with validation errors. ⚠️\n');

    // Error test cases - these will be skipped by our validation
    // But we can use skipValidation=true to force-send them
    const missingFleetEvent = generateBasicEvent();
    delete missingFleetEvent.fleetNumber;
    await sendDriverBehaviorEvent({
      events: [missingFleetEvent]
    }, "Missing Fleet Number (Should Fail Validation)", true);

    const missingEventTypeEvent = generateBasicEvent();
    delete missingEventTypeEvent.eventType;
    await sendDriverBehaviorEvent({
      events: [missingEventTypeEvent]
    }, "Missing Event Type (Should Fail Validation)", true);

    const missingEventTimeEvent = generateBasicEvent();
    delete missingEventTimeEvent.eventTime;
    await sendDriverBehaviorEvent({
      events: [missingEventTimeEvent]
    }, "Missing Event Time (Should Fail Validation)", true);

    await sendDriverBehaviorEvent({
      data: "This payload is missing the events array"
    }, "No Events Array (Should Fail Validation)", true);
    
    console.log('\n📊 Test Summary - INVALID TESTS 📊');
    console.log('=================================');
    console.log('All invalid tests completed. These tests are expected to fail with validation errors.');

  } catch (error) {
    console.error('Error running invalid tests:', error);
  }
}

// Main function
async function main() {
  console.log('🔧 Driver Behavior Webhook Test Tool 🔧');
  console.log('======================================');
  console.log(`Environment: ${ENV}`);
  console.log(`Target URL: ${DRIVER_BEHAVIOR_WEBHOOK_URL}`);
  console.log('======================================\n');
  
  // Always run valid tests
  await runValidTests();
  
  // Only run invalid tests if explicitly requested via command line arg
  const shouldRunInvalidTests = process.argv.includes('--run-invalid-tests');
  if (shouldRunInvalidTests) {
    await runInvalidTests();
  } else {
    console.log('\n⚠️ Invalid payload tests were skipped.');
    console.log('To run invalid tests, add the --run-invalid-tests flag:');
    console.log('  node improved-driver-behavior-webhook-test.js --run-invalid-tests');
  }
  
  console.log('\n🏁 All requested tests completed! 🏁');
}

// Run the script
main();