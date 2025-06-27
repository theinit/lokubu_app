// Script de debugging para verificar configuración de Firebase
// Ejecutar con: node debug-firebase.js

console.log('🔍 VERIFICANDO CONFIGURACIÓN DE FIREBASE...');
console.log('==========================================');

// Simular carga de variables de entorno como lo hace Vite
const envVars = {
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID
};

console.log('📋 Variables de entorno encontradas:');
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${key}: NO DEFINIDA`);
  }
});

console.log('\n🔧 Verificaciones:');

// Verificar archivo .env.local
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ Archivo .env.local existe');
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  console.log(`📄 Variables definidas en .env.local: ${lines.length}`);
  
  // Verificar si hay comillas problemáticas
  const problematicLines = lines.filter(line => {
    const [, value] = line.split('=');
    return value && (value.startsWith('"') || value.startsWith("'"));
  });
  
  if (problematicLines.length > 0) {
    console.log('⚠️  ADVERTENCIA: Variables con comillas detectadas:');
    problematicLines.forEach(line => console.log(`   ${line}`));
    console.log('   Esto puede causar problemas. Remueve las comillas.');
  }
} else {
  console.log('❌ Archivo .env.local NO EXISTE');
  console.log('   Ejecuta: cp .env.example .env.local');
}

// Verificar storage bucket específicamente
const storageBucket = envVars.VITE_FIREBASE_STORAGE_BUCKET;
if (storageBucket) {
  if (storageBucket === 'lokubu-b5d9f.appspot.com') {
    console.log('✅ Storage bucket configurado correctamente');
  } else {
    console.log(`⚠️  Storage bucket: ${storageBucket}`);
    console.log('   Debería ser: lokubu-b5d9f.appspot.com');
  }
} else {
  console.log('❌ VITE_FIREBASE_STORAGE_BUCKET no definida');
}

console.log('\n🚀 PRÓXIMOS PASOS:');
console.log('1. Asegúrate de que .env.local existe y tiene todas las variables');
console.log('2. Verifica que Firebase Storage esté habilitado en Console');
console.log('3. Configura las reglas de Storage según SOLUCION_CORS_FIREBASE_STORAGE.md');
console.log('4. Reinicia el servidor de desarrollo (npm run dev)');
console.log('==========================================');