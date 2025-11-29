# Despliegue en Vercel

Sigue estos pasos para publicar **Verax Transcript Hub** en internet.

## Prerrequisitos
1.  Una cuenta en [GitHub](https://github.com).
2.  Una cuenta en [Vercel](https://vercel.com).
3.  Tu **Groq API Key**.

## Pasos

### 1. Subir código a GitHub
1.  Crea un **nuevo repositorio** en GitHub (puede ser privado).
2.  Sube los archivos de este proyecto al repositorio.

### 2. Configurar en Vercel
1.  Ve a tu panel de Vercel y haz clic en **"Add New..."** -> **"Project"**.
2.  Importa el repositorio de GitHub que acabas de crear.
3.  En la configuración del proyecto ("Configure Project"):
    *   **Framework Preset**: Vite (debería detectarse automáticamente).
    *   **Root Directory**: `./` (déjalo como está).
4.  **IMPORTANTE: Variables de Entorno**:
    *   Haz clic en **"Environment Variables"**.
    *   Agrega una nueva variable:
        *   **Key**: `VITE_GROQ_API_KEY`
        *   **Value**: `gsk_...` (Tu clave real de Groq).
    *   Haz clic en "Add".
5.  Haz clic en **"Deploy"**.

### 3. ¡Listo!
Vercel construirá la aplicación. Una vez termine, te dará una URL (ej: `verax-transcript-hub.vercel.app`) donde tu equipo podrá usar la herramienta.

> **Nota**: El archivo `vercel.json` incluido en el proyecto asegura que el procesador de video (`ffmpeg.wasm`) funcione correctamente en la nube.
