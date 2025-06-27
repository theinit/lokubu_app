# 🔥 Reglas de Firestore Actualizadas para Eliminación de Cuentas

## Reglas Necesarias para la Funcionalidad de Eliminar Cuenta

Para que la funcionalidad de eliminación de cuenta funcione correctamente, necesitas actualizar las reglas de Firestore en Firebase Console.

### 📋 Reglas Recomendadas

Copia y pega estas reglas en Firebase Console → Firestore Database → Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para la colección de usuarios
    match /users/{userId} {
      // Permitir lectura, escritura y eliminación solo al propietario de la cuenta
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para experiencias
    match /experiences/{experienceId} {
      // Permitir lectura a usuarios autenticados
      allow read: if request.auth != null;
      // Permitir escritura y eliminación solo al creador
      allow write, delete: if request.auth != null && 
        (resource == null || resource.data.createdBy == request.auth.uid);
    }
    
    // Regla general para otras colecciones (opcional)
    match /{document=**} {
      // Permitir lectura y escritura para usuarios autenticados
      allow read, write: if request.auth != null;
    }
  }
}
```

### 🔑 Cambios Importantes

1. **Agregado `delete` a las reglas de usuarios**: Ahora los usuarios pueden eliminar su propio documento
2. **Reglas específicas para experiencias**: Control granular sobre quién puede eliminar experiencias
3. **Seguridad mejorada**: Solo el propietario puede eliminar sus propios datos

### 📝 Pasos para Actualizar las Reglas

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Firestore Database**
4. Haz clic en la pestaña **Reglas**
5. Reemplaza las reglas existentes con las de arriba
6. Haz clic en **Publicar**

### ⚠️ Consideraciones de Seguridad

- **Solo el propietario puede eliminar**: Las reglas aseguran que solo el usuario autenticado pueda eliminar su propia cuenta
- **Eliminación en cascada**: Considera si quieres eliminar también las experiencias creadas por el usuario
- **Backup de datos**: Considera implementar un sistema de backup antes de la eliminación

### 🧪 Reglas de Desarrollo (Solo para Testing)

Si necesitas reglas más permisivas durante el desarrollo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write, delete: if request.auth != null;
    }
  }
}
```

**⚠️ IMPORTANTE**: No uses estas reglas en producción, son demasiado permisivas.

### 🔍 Verificación

Para verificar que las reglas funcionan:

1. Inicia sesión en tu aplicación
2. Ve al perfil de usuario
3. Intenta eliminar la cuenta
4. Verifica en la consola del navegador que no hay errores de permisos
5. Confirma en Firebase Console que el documento del usuario fue eliminado

### 📊 Monitoreo

Puedes monitorear las operaciones de eliminación en:
- Firebase Console → Firestore → Uso
- Logs de la aplicación (busca los emojis 🔄, ✅, ❌)