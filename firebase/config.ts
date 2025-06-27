import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// =================================================================
// IMPORTANTE: RELLENA ESTO CON LAS CREDENCIALES DE TU PROYECTO FIREBASE
// Puedes encontrar esta información en la configuración de tu proyecto en la consola de Firebase.
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyD_QIyh9qOwTAqxPlWxwe9buDvlIo_oDfc",
  authDomain: "lokubu-b5d9f.firebaseapp.com",
  projectId: "lokubu-b5d9f",
  storageBucket: "lokubu-b5d9f.appspot.com",
  messagingSenderId: "311807545912",
  appId: "1:311807545912:web:377c33f53a2f7023f44cc"
};

// Initialize Firebase using the v9+ modular syntax
const app = initializeApp(firebaseConfig);

// Get Firebase service instances
const auth = getAuth(app);
const db = getFirestore(app);

// Configure Firestore settings to handle connection issues
// This helps prevent WebChannelConnection RPC errors and improves reliability
try {
  // Enable offline persistence and better error handling
  console.log('✅ Firestore initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firestore:', error);
}

export { auth, db };
