# Limitaciones del Sistema de Mensajería

Para evitar el spam y garantizar un uso racional del sistema de mensajería entre anfitriones y huéspedes, se han implementado las siguientes limitaciones:

## 📋 Limitaciones Implementadas

### 1. **Límite de Longitud de Mensaje**
- **Máximo**: 500 caracteres por mensaje
- **Validación**: Frontend y visual con contador en tiempo real
- **Comportamiento**: El campo de entrada tiene `maxLength={500}` y se muestra un contador de caracteres

### 2. **Cooldown entre Mensajes**
- **Tiempo de espera**: 30 segundos entre mensajes consecutivos
- **Alcance**: Por usuario y por reserva específica
- **Almacenamiento**: localStorage con clave `lastMessage_{userId}_{bookingId}`
- **Feedback**: Mensaje de alerta mostrando tiempo restante

### 3. **Límite Diario de Mensajes**
- **Máximo**: 10 mensajes por día por reserva
- **Alcance**: Por usuario y por reserva específica
- **Reinicio**: Automático cada día (basado en fecha)
- **Almacenamiento**: localStorage con clave `dailyMessages_{userId}_{bookingId}_{date}`
- **Indicador visual**: Se muestra "Límite: 10 mensajes por día" en la interfaz

## 🔧 Implementación Técnica

### Archivos Modificados
- `components/MyBookings.tsx` - Limitaciones para huéspedes
- `components/HostBookings.tsx` - Limitaciones para anfitriones

### Validaciones en Frontend
```javascript
// Límite de longitud
if (messageText.length > 500) {
  alert('El mensaje no puede exceder 500 caracteres.');
  return;
}

// Cooldown de 30 segundos
const now = Date.now();
const lastMessageTime = localStorage.getItem(`lastMessage_${currentUser.id}_${selectedBooking.id}`);
if (lastMessageTime && (now - parseInt(lastMessageTime)) < 30000) {
  const remainingTime = Math.ceil((30000 - (now - parseInt(lastMessageTime))) / 1000);
  alert(`Debes esperar ${remainingTime} segundos antes de enviar otro mensaje.`);
  return;
}

// Límite diario
const today = new Date().toDateString();
const dailyCountKey = `dailyMessages_${currentUser.id}_${selectedBooking.id}_${today}`;
const dailyCount = parseInt(localStorage.getItem(dailyCountKey) || '0');
if (dailyCount >= 10) {
  alert('Has alcanzado el límite de 10 mensajes por día para esta reserva.');
  return;
}
```

### Interfaz de Usuario
- **Contador de caracteres**: `{newMessage.length}/500 caracteres`
- **Indicador de límite diario**: `Límite: 10 mensajes por día`
- **Atributo maxLength**: Previene escritura más allá de 500 caracteres
- **Alertas informativas**: Mensajes claros sobre limitaciones alcanzadas

## 🎯 Objetivos Cumplidos

1. **Prevención de spam**: Cooldown de 30 segundos evita envío masivo
2. **Uso racional**: Límite de 10 mensajes diarios fomenta comunicación concisa
3. **Experiencia de usuario**: Contadores visuales y feedback claro
4. **Consistencia**: Mismas reglas para anfitriones y huéspedes
5. **Flexibilidad**: Límites razonables que no impiden comunicación legítima

## 🔄 Consideraciones Futuras

### Posibles Mejoras
- **Validación en backend**: Agregar validaciones en `firestoreService.ts`
- **Límites personalizables**: Permitir ajustar límites por tipo de usuario
- **Historial de limitaciones**: Registro de intentos bloqueados
- **Notificaciones**: Sistema de notificaciones en lugar de alerts
- **Límites por tiempo**: Límites por hora además de diarios

### Configuración Recomendada para Producción
- Mover límites a variables de configuración
- Implementar validaciones en Firestore Security Rules
- Agregar logging de intentos de spam
- Considerar límites más estrictos si es necesario

## 📊 Métricas de Uso

Para monitorear la efectividad de estas limitaciones, se recomienda trackear:
- Número de mensajes bloqueados por límite de caracteres
- Número de mensajes bloqueados por cooldown
- Número de usuarios que alcanzan el límite diario
- Tiempo promedio entre mensajes
- Satisfacción del usuario con el sistema de mensajería