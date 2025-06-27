# 🐛 Guía de Debugging - Errores de Consola Firestore

## Errores Actuales en la Consola

### 1. Error 400 Bad Request
```
GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel_rpc&SID=... 400 (Bad Request)
```

### 2. WebChannelConnection RPC Error
```
@firebase/firestore: Firestore (11.9.0): WebChannelConnection RPC 'Listen' stream 0x23331849 transport errored. Name: undefined Message: undefined
```

## 🔍 Información de Debugging Agregada

Hemos agregado logging detallado en varios archivos para ayudar a diagnosticar estos errores:

### En `firestoreService.ts`:
- ✅ Manejo específico de errores `permission-denied`
- ✅ Detección de errores de conexión `unavailable`
- ✅ Identificación de errores 400 con sugerencias de solución
- ✅ Logging detallado de operaciones de lectura/escritura

### En `AuthContext.tsx`:
- ✅ Logging del estado completo de autenticación
- ✅ Información sobre tokens de acceso
- ✅ Estado de verificación de email
- ✅ Debounce de 300ms para evitar solicitudes repetitivas

## 🚀 Pasos para Debugging

### 1. Verificar Estado de Autenticación
Abre la consola del navegador y busca estos logs:
```
🔍 Estado de autenticación: {
  uid: "...",
  email: "...",
  emailVerified: true/false,
  isAnonymous: false,
  accessToken: "Presente"/"Ausente"
}
```

### 2. Verificar Errores Específicos
Busca en la consola mensajes como:
- `🚫 Error de permisos: Verifica las reglas de Firestore`
- `🌐 Error de conexión: Firestore no está disponible`
- `🔧 Error 400: Solicitud incorrecta a Firestore`

### 3. Soluciones Según el Error

#### Si ves "Error de permisos":
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a Firestore Database → Reglas
4. Verifica que las reglas permitan acceso a usuarios autenticados

#### Si ves "Error de conexión":
1. Deshabilita bloqueadores de anuncios (AdBlock, uBlock Origin)
2. Agrega `localhost` a la lista blanca
3. Prueba en modo incógnito
4. Verifica tu conexión a internet

#### Si ves "Error 400":
1. Verifica la configuración de Firebase en `config.ts`
2. Asegúrate de que el proyecto ID sea correcto
3. Verifica que las reglas de Firestore estén bien configuradas

## 🔧 Configuración Recomendada de Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso a usuarios autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir lectura de experiencias a usuarios autenticados
    match /experiences/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 📊 Monitoreo Continuo

Para monitorear estos errores:

1. **Abre las DevTools** (F12)
2. **Ve a la pestaña Console**
3. **Filtra por "firebase" o "firestore"**
4. **Busca los emojis de debugging**: 🔄, ✅, ❌, 🚫, 🌐, 🔧

## 🎯 Próximos Pasos

1. Ejecuta la aplicación
2. Abre la consola del navegador
3. Intenta hacer login/registro
4. Observa los logs detallados
5. Reporta cualquier error específico que veas

## 📝 Notas Importantes

- Los errores de WebChannelConnection pueden ser normales si los datos siguen funcionando
- Los errores 400 suelen indicar problemas de configuración o permisos
- El debounce de 300ms ayuda a reducir solicitudes repetitivas
- Todos los errores ahora tienen mensajes específicos con soluciones sugeridas