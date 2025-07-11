/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_DATABASE_URL: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FIREBASE_DATABASE_ID?: string;

  readonly VITE_WIALON_TOKEN?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;

  readonly VITE_ENV_MODE: 'development' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
