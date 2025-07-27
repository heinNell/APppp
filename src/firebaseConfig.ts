import { initializeApp } from "firebase/app";

// Default configuration for development and fallback
const firebaseConfig = {
  apiKey: "AIzaSyBY8wpMVn9GooWA37NNimmz5l-sE4J3vBg",
  authDomain: "matdash-19d20.firebaseapp.com",
  projectId: "matdash-19d20",
  storageBucket: "matdash-19d20.firebasestorage.app",
  messagingSenderId: "92797218549",
  appId: "1:92797218549:web:024a569baabef4fa3d1fbc",
  measurementId: "G-K748DNNKWZ"
};

// Use environment variables from .env with fallback to default config
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || defaultConfig.databaseURL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket, // <<--- REG GEMAAK
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultConfig.measurementId
};

// DEBUG ONLY – To detect missing environment variables during development
if (import.meta.env.DEV) {
  console.log('Firebase Config:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Present' : '✗ Missing',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ Present' : '✗ Missing',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ? '✓ Present' : '✗ Missing',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Present' : '✗ Missing',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✓ Present' : '✗ Missing',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✓ Present' : '✗ Missing',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✓ Present' : '✗ Missing',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? '✓ Present' : '✗ Missing'
  });
}

const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  if (missingFields.length > 0) {
    console.warn('⚠️ Using fallback values for Firebase configuration:', missingFields);
    return false;
  }
  return true;
};
validateConfig();

export const firebaseApp = initializeApp(firebaseConfig);
