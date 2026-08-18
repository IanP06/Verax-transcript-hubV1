# Despliegue en Vercel

Sigue estos pasos para publicar **Verax Transcript Hub** en internet.

## Prerrequisitos
1.  Una cuenta en [GitHub](https://github.com).
2.  Una cuenta en [Vercel](https://vercel.com).
3.  Tu **Groq API Key**.

## Pasos

### 1. Subir código a GitHub

**Si es la primera vez:**
1.  Abre la terminal en la carpeta del proyecto.
2.  Ejecuta estos comandos uno por uno:
    ```bash
    git init
    git add .
    git commit -m "Primer despliegue: Verax Transcript Hub"
    git branch -M main
    ```
3.  Ve a GitHub, crea un nuevo repositorio y copia el comando que dice `git remote add origin ...`
4.  Pégalo en tu terminal y luego ejecuta:
    ```bash
    git push -u origin main
    ```

**Si ya está configurado (para actualizaciones futuras):**

### 2. Configurar en Vercel
1.  Ve a tu panel de Vercel y haz clic en **"Add New..."** -> **"Project"**.
2.  Importa el repositorio de GitHub que acabas de crear.
3.  En la configuración del proyecto ("Configure Project"):
    *   **Framework Preset**: Vite (debería detectarse automáticamente).
    *   **Root Directory**: `./` (déjalo como está).
4.  **IMPORTANTE: Variables de Entorno**:
    *   Haz clic en **"Environment Variables"**.
    *   Agrega las siguientes variables (Key y Value correspondientes de tu proyecto Firebase):
        *   `VITE_GROQ_API_KEY`: Tu clave real de Groq.
        *   `VITE_FIREBASE_API_KEY`
        *   `VITE_FIREBASE_AUTH_DOMAIN`
        *   `VITE_FIREBASE_PROJECT_ID`
        *   `VITE_FIREBASE_STORAGE_BUCKET`
        *   `VITE_FIREBASE_MESSAGING_SENDER_ID`
        *   `VITE_FIREBASE_APP_ID`
        *   `VITE_FIREBASE_MEASUREMENT_ID` (Opcional)
    *   **Nota**: Recuerda agregar tu dominio de Vercel (ej: `tu-app.vercel.app`) en la lista de "Authorized Domains" en la consola de Firebase Authentication.
    *   Haz clic en "Add" para cada una.
5.  Haz clic en **"Deploy"**.

### 3. ¡Listo!
Vercel construirá la aplicación. Una vez termine, te dará una URL (ej: `verax-transcript-hub.vercel.app`) donde tu equipo podrá usar la herramienta.

> **Nota**: El archivo `vercel.json` incluido en el proyecto asegura que el procesador de video (`ffmpeg.wasm`) funcione correctamente en la nube.

## Cómo Actualizar (Redeploy)

Cada vez que quieras subir cambios (como el nuevo prompt o mejoras):

1.  Abre la terminal en la carpeta del proyecto.
2.  Ejecuta estos comandos:
    ```bash
    git add .
    git commit -m "Actualización: Nuevo prompt y optimización de audio"
    git push origin main
    ```
3.  Vercel detectará automáticamente el cambio y volverá a publicar la web en unos minutos.
