// Shared firebase config loader for migration scripts. Reads from env vars with fallbacks.
const env = process.env as Record<string, string | undefined>;
export const envFirebaseConfig = {
  apiKey: env['FB_API_KEY'] || 'AIzaSyDacE5eQwoYQ9zCThMvizeblK_zZfc-ShE',
  authDomain: env['FB_AUTH_DOMAIN'] || 'vendor-hc.firebaseapp.com',
  projectId: env['FB_PROJECT_ID'] || 'vendor-hc',
  storageBucket: env['FB_STORAGE_BUCKET'] || 'vendor-hc.firebasestorage.app',
  messagingSenderId: env['FB_MSG_SENDER_ID'] || '711170271683',
  appId: env['FB_APP_ID'] || '1:711170271683:web:e6b2890d4f65aebb58f576',
  measurementId: env['FB_MEASUREMENT_ID'] || 'G-TZM2MNNC8C'
};
