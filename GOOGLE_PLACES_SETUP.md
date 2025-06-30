# Configuración de Google Places API

Este documento explica cómo configurar Google Places API para la normalización de ubicaciones en Lokubu.

## 1. Obtener API Key de Google Places

### Paso 1: Crear un proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Asegúrate de que la facturación esté habilitada para el proyecto

### Paso 2: Habilitar las APIs necesarias
1. Ve a "APIs y servicios" > "Biblioteca"
2. Busca y habilita las siguientes APIs:
   - **Places API (New)**
   - **Geocoding API**
   - **Maps JavaScript API**

### Paso 3: Crear credenciales
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Copia la clave generada

### Paso 4: Configurar restricciones (Recomendado)
1. Haz clic en la clave de API creada
2. En "Restricciones de aplicación":
   - Selecciona "Referentes HTTP (sitios web)"
   - Agrega tu dominio (ej: `localhost:*`, `tu-dominio.com/*`)
3. En "Restricciones de API":
   - Selecciona "Restringir clave"
   - Selecciona las APIs habilitadas anteriormente

## 2. Configurar la aplicación

### Paso 1: Agregar la API Key al archivo .env
```bash
# Copia .env.example a .env
cp .env.example .env

# Edita .env y agrega tu API Key
VITE_GOOGLE_PLACES_API_KEY=tu_api_key_aqui
```

### Paso 2: Reiniciar el servidor de desarrollo
```bash
npm run dev
```

## 3. Funcionalidades implementadas

### Autocompletado de ubicaciones
- Los formularios de crear y editar experiencias ahora incluyen autocompletado de ubicaciones
- Utiliza Google Places API para sugerir ciudades mientras escribes
- Normaliza automáticamente las ubicaciones seleccionadas

### Búsqueda mejorada
- La búsqueda de experiencias ahora funciona con ubicaciones normalizadas
- Encuentra experiencias aunque uses diferentes variaciones del nombre de la ciudad
- Ejemplo: "Londres", "London", "London, UK" encontrarán las mismas experiencias

### Datos almacenados
Cada experiencia ahora incluye:
- `location`: Texto original ingresado por el usuario
- `latitude` y `longitude`: Coordenadas precisas
- `placeId`: ID único de Google Places para la ubicación
- `normalizedLocation`: Objeto con información normalizada:
  - `name`: Nombre principal de la ciudad
  - `formattedAddress`: Dirección formateada por Google
  - `city`: Nombre de la ciudad
  - `country`: Nombre del país

## 4. Costos y límites

### Precios de Google Places API (aproximados)
- **Autocomplete**: $2.83 por 1,000 solicitudes
- **Place Details**: $17 por 1,000 solicitudes
- **Geocoding**: $5 por 1,000 solicitudes

### Límites gratuitos
- Google ofrece $200 USD en créditos mensuales gratuitos
- Esto equivale aproximadamente a:
  - 70,000 solicitudes de Autocomplete
  - 11,000 solicitudes de Place Details
  - 40,000 solicitudes de Geocoding

### Optimizaciones implementadas
- Debounce de 300ms en el autocompletado para reducir solicitudes
- Caché de resultados en el navegador
- Filtrado solo por ciudades para reducir resultados irrelevantes

## 5. Solución de problemas

### Error: "Google Places API not loaded"
- Verifica que la API Key esté configurada correctamente
- Asegúrate de que las APIs estén habilitadas en Google Cloud Console
- Revisa las restricciones de la API Key

### Error: "This API project is not authorized"
- Verifica que la facturación esté habilitada en Google Cloud
- Asegúrate de que las APIs necesarias estén habilitadas

### Autocompletado no funciona
- Verifica la consola del navegador para errores
- Asegúrate de que el dominio esté en las restricciones de la API Key
- Verifica que la variable de entorno esté configurada correctamente

## 6. Migración de datos existentes

Las experiencias existentes seguirán funcionando normalmente. Para normalizar ubicaciones existentes:

1. Los usuarios pueden editar sus experiencias para activar la normalización automática
2. Se puede implementar un script de migración para normalizar todas las ubicaciones existentes
3. La búsqueda funcionará tanto con ubicaciones normalizadas como con las originales

## 7. Alternativas

Si prefieres no usar Google Places API, puedes:

1. **Usar Nominatim (OpenStreetMap)**: Gratuito pero con menos precisión
2. **Crear una base de datos interna**: Para ciudades principales
3. **Usar otros servicios**: MapBox, Here Maps, etc.

La implementación está diseñada para ser modular y fácil de cambiar el proveedor de geocodificación.