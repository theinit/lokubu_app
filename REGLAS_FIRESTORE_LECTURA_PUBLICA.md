# Reglas de Firestore para Lectura Pública de Experiencias

## Problema Identificado

Actualmente, las reglas de Firestore requieren autenticación para leer experiencias:
```javascript
match /experiences/{experienceId} {
  allow read: if request.auth != null; // ❌ Requiere autenticación
}
```

Esto impide que usuarios no autenticados puedan ver las experiencias disponibles, lo cual es problemático para la experiencia de usuario.

## Solución: Reglas Actualizadas

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
      // ✅ Permitir lectura pública (sin autenticación requerida)
      allow read: if true;
      // Permitir escritura solo a usuarios autenticados
      allow create: if request.auth != null;
      // Permitir actualización y eliminación solo al creador
      allow update, delete: if request.auth != null && 
        resource.data.host.id == request.auth.uid;
    }
    
    // Regla general para otras colecciones
    match /{document=**} {
      // Permitir lectura y escritura solo para usuarios autenticados
      allow read, write: if request.auth != null;
    }
  }
}
```

## Cambios Realizados

1. **Lectura pública de experiencias**: `allow read: if true;` permite que cualquier usuario (autenticado o no) pueda leer las experiencias
2. **Creación controlada**: Solo usuarios autenticados pueden crear experiencias
3. **Modificación segura**: Solo el creador de la experiencia puede editarla o eliminarla
4. **Usuarios protegidos**: Los datos de usuario siguen requiriendo autenticación

## Beneficios

- ✅ Los usuarios no autenticados pueden explorar experiencias
- ✅ Mejora la experiencia de usuario inicial
- ✅ Mantiene la seguridad para operaciones sensibles
- ✅ Permite que los usuarios vean contenido antes de registrarse

## Pasos para Implementar

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Firestore Database**
4. Haz clic en la pestaña **Reglas**
5. Reemplaza las reglas actuales con las de arriba
6. Haz clic en **Publicar**

## Verificación

Para verificar que funciona:
1. Cierra sesión en la aplicación
2. Navega a la página principal
3. Verifica que las experiencias se cargan correctamente
4. Confirma que no aparecen errores de permisos en la consola

## Consideraciones de Seguridad

- Las experiencias son de lectura pública, lo cual es apropiado para una plataforma de turismo
- Los datos sensibles de usuarios siguen protegidos
- Solo los creadores pueden modificar sus propias experiencias
- La creación de experiencias requiere autenticación