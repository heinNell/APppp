import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SyncProvider } from './context/SyncContext';
import './index.css';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Get reCAPTCHA site key from environment variables
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Create a component to show when reCAPTCHA key is missing
const RecaptchaKeyError = () => (
  <div style={{
    padding: '20px',
    maxWidth: '600px',
    margin: '100px auto',
    textAlign: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#fff3f3',
    border: '1px solid #ffcaca',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }}>
    <h1 style={{ color: '#e53e3e', marginBottom: '16px' }}>Configuration Error</h1>
    <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
      The reCAPTCHA site key is missing from environment variables.
      This is required for the application to function properly.
    </p>
    <div style={{
      backgroundColor: '#f7fafc',
      padding: '12px',
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      textAlign: 'left',
      fontFamily: 'monospace',
      marginBottom: '16px'
    }}>
      <p style={{ margin: '0' }}>VITE_RECAPTCHA_SITE_KEY is not set</p>
    </div>
    <p style={{ fontSize: '14px', color: '#4a5568' }}>
      Please check your environment configuration or contact support.
    </p>
  </div>
);

// Log detailed error in development for debugging
if (!recaptchaSiteKey && import.meta.env.DEV) {
  console.error(
    "Missing required environment variable: VITE_RECAPTCHA_SITE_KEY\n" +
    "Please ensure this variable is set in your .env file or deployment environment.\n" +
    "For local development, create or update your .env file with: VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key"
  );
}

// Mount the app to the root div
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {recaptchaSiteKey ? (
        <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
          <SyncProvider>
            <App />
          </SyncProvider>
        </GoogleReCaptchaProvider>
      ) : (
        <RecaptchaKeyError />
      )}
    </StrictMode>
  );
}