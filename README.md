# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copia `.env.example` a `.env.local` y configura las variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
   Luego edita `.env.local` y configura:
   - `GEMINI_API_KEY`: Tu clave de Gemini API
   - Variables de Firebase (`VITE_FIREBASE_*`): Obtén estos valores de la consola de Firebase
3. Run the app:
   `npm run dev`
