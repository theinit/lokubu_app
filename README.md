# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copia `.env.example` a `.env.local` y configura tu clave API de Gemini:
   ```bash
   cp .env.example .env.local
   ```
   Luego edita `.env.local` y reemplaza `tu_clave_api_aqui` con tu clave real de Gemini API
3. Run the app:
   `npm run dev`
