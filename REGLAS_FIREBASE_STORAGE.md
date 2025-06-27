# Reglas de Firebase Storage

## Problema CORS Identificado

El error CORS que estás experimentando se debe a que las reglas de Firebase Storage no están configuradas correctamente para permitir la subida y eliminación de imágenes de perfil.

## 🔧 Solución: Configurar Reglas de Storage

### Pasos para Configurar las Reglas

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto **lokubu-b5d9f**
3. Ve a **Storage** en el menú lateral
4. Haz clic en la pestaña **Rules**
5. Reemplaza las reglas existentes con las siguientes:

### 📋 Reglas Recomendadas para Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Reglas para imágenes de perfil
    match /profile_images/{userId}/{allPaths=**} {
      // Permitir lectura a todos los usuarios autenticados
      allow read: if request.auth != null;
      // Permitir escritura y eliminación solo al propietario
      allow write, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para imágenes de experiencias (si las hay)
    match /experience_images/{allPaths=**} {
      // Permitir lectura a todos los usuarios autenticados
      allow read: if request.auth != null;
      // Permitir escritura a usuarios autenticados
      allow write: if request.auth != null;
    }
    
    // Regla general para otros archivos
    match /{allPaths=**} {
      // Permitir lectura y escritura para usuarios autenticados
      allow read, write: if request.auth != null;
    }
  }
}
```

### 🔑 Explicación de las Reglas

1. **profile_images/{userId}/{allPaths=**}**: 
   - Solo el propietario puede subir/eliminar sus imágenes de perfil
   - Todos los usuarios autenticados pueden ver las imágenes

2. **experience_images/{allPaths=**}**: 
   - Usuarios autenticados pueden subir imágenes de experiencias
   - Todos pueden ver las imágenes

3. **Regla general**: 
   - Fallback para otros tipos de archivos
   - Requiere autenticación para cualquier operación

### ⚠️ Importante

Después de actualizar las reglas:
1. Haz clic en **"Publicar"** en Firebase Console
2. Espera unos minutos para que los cambios se propaguen
3. Prueba nuevamente la funcionalidad de subir imagen de perfil

### 🐛 Corrección Adicional en el Código

También se corrigió un bug en la función `uploadProfileImage` donde se intentaba usar la URL completa de descarga como referencia de Storage. Ahora se extrae correctamente la ruta del archivo desde la URL.

### 🔍 Verificación y Solución de Problemas

#### Pasos para Verificar las Reglas:
1. Ve a Firebase Console → Storage → Rules
2. Confirma que las reglas están publicadas
3. Verifica que el bucket de Storage esté configurado correctamente

#### Si el Error CORS Persiste:

**1. Verifica la Configuración del Proyecto:**
```bash
# En la consola del navegador, verifica:
console.log('Storage Bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
# Debe mostrar: lokubu-b5d9f.appspot.com
```

**2. Reglas de Storage Obligatorias:**
Asegúrate de que estas reglas estén EXACTAMENTE así en Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir acceso a imágenes de perfil
    match /profile_images/{userId}/{allPaths=**} {
      allow read: if true; // Permitir lectura pública
      allow write, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regla general más permisiva para debugging
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**3. Pasos de Solución Inmediata:**
1. Ve a Firebase Console
2. Storage → Rules
3. Copia y pega las reglas exactas de arriba
4. Haz clic en "Publicar"
5. Espera 2-3 minutos
6. Recarga tu aplicación completamente (Ctrl+F5)

**4. Verificación Final:**
- Abre las herramientas de desarrollador
- Ve a la pestaña Network
- Intenta subir una imagen
- Verifica que no aparezcan errores CORS

#### Mejoras Implementadas en el Código:
- ✅ Validación de tamaño de archivo (máx 5MB)
- ✅ Validación de tipos de archivo permitidos
- ✅ Mejor manejo de errores con mensajes específicos
- ✅ Sanitización de nombres de archivo
- ✅ Metadatos adicionales para tracking
- ✅ Subida primero, eliminación después (más seguro)