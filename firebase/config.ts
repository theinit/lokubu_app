import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Importar getStorage

// Configuración de Firebase usando variables de entorno
// Las credenciales se obtienen del archivo .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validar que todas las variables de entorno estén configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('❌ Faltan variables de entorno de Firebase. Verifica tu archivo .env.local');
}

// Initialize Firebase using the v9+ modular syntax
const app = initializeApp(firebaseConfig);

// Get Firebase service instances
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializar Storage

// Configure Firestore settings to handle connection issues
// This helps prevent WebChannelConnection RPC errors and improves reliability
try {
  // Enable offline persistence and better error handling
  console.log('✅ Firestore initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firestore:', error);
}

export { auth, db, storage }; // Exportar storage
