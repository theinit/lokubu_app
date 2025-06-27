# Solución a Errores de Firestore

## Errores que estás viendo:

### 1. Error 400 (Bad Request)
```
GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel... 400 (Bad Request)
```

### 2. WebChannelConnection RPC Error
```
@firebase/firestore: Firestore (11.9.0): WebChannelConnection RPC 'Listen' stream transport errored
```

## Causas principales:

1. **Reglas de seguridad de Firestore incorrectas o muy restrictivas**
2. **Usuario no autenticado intentando acceder a datos protegidos**
3. **Problemas de red o bloqueadores de anuncios**
4. **Configuración incorrecta del proyecto Firebase**

## Soluciones paso a paso:

### Paso 1: Verificar y configurar las reglas de Firestore

1. **Ve a la Consola de Firebase:**
   - Abre https://console.firebase.google.com
   - Selecciona tu proyecto `lokubu-b5d9f`

2. **Navega a Firestore Database:**
   - En el menú lateral, haz clic en "Firestore Database"
   - Ve a la pestaña "Reglas" (Rules)

3. **Configura las reglas de seguridad:**
   Reemplaza las reglas existentes con estas:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Permitir lectura y escritura para usuarios autenticados
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
       
       // Reglas específicas para la colección de usuarios
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Reglas para experiencias (si las tienes)
       match /experiences/{experienceId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
     }
   }
   ```

4. **Publica las reglas:**
   - Haz clic en "Publicar" (Publish)

### Paso 2: Verificar la configuración de Authentication

1. **Ve a Authentication en Firebase Console**
2. **Verifica que esté habilitado:**
   - El método "Correo electrónico/contraseña" debe estar activado
3. **Verifica dominios autorizados:**
   - En la pestaña "Settings" → "Authorized domains"
   - Asegúrate de que `localhost` esté en la lista

### Paso 3: Reglas temporales para desarrollo (SOLO PARA TESTING)

**⚠️ ADVERTENCIA: Solo usar durante desarrollo, NUNCA en producción**

Si necesitas probar rápidamente, puedes usar estas reglas temporales:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // TEMPORAL - CAMBIAR ANTES DE PRODUCCIÓN
    }
  }
}
```

### Paso 4: Verificar el estado de autenticación

1. **Abre las herramientas de desarrollador (F12)**
2. **Ve a la pestaña Console**
3. **Busca estos logs:**
   - ✅ "Usuario autenticado, obteniendo perfil de Firestore..."
   - ❌ "Usuario no autenticado"

### Paso 5: Solucionar problemas de red

1. **Deshabilita temporalmente el bloqueador de anuncios**
2. **Prueba en modo incógnito**
3. **Verifica tu conexión a internet**

## Debugging adicional:

### Verificar el estado de autenticación en el código:

Agrega este código temporal en tu `AuthContext.tsx` para debug:

```javascript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('🔍 Estado de autenticación:', {
      isAuthenticated: !!user,
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName
    });
  });
  return unsubscribe;
}, []);
```

### Verificar las reglas de Firestore desde el código:

Puedes probar una consulta simple:

```javascript
// En la consola del navegador
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';

// Probar acceso a una colección
getDocs(collection(db, 'users'))
  .then(() => console.log('✅ Acceso a Firestore exitoso'))
  .catch(error => console.error('❌ Error de acceso a Firestore:', error));
```

## Próximos pasos:

1. **Implementa las reglas de seguridad correctas**
2. **Verifica que el usuario esté autenticado antes de acceder a Firestore**
3. **Prueba el registro y login**
4. **Monitorea los logs de la consola**

## Si el problema persiste:

1. **Verifica que el proyecto Firebase esté activo**
2. **Revisa la facturación (si aplicable)**
3. **Contacta al soporte de Firebase**

---

**Nota importante:** Los errores de WebChannelConnection son comunes y a menudo no afectan la funcionalidad real de la aplicación. Si los datos se están guardando y recuperando correctamente, estos errores pueden ser ignorados en desarrollo.