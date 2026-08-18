import Groq from 'groq-sdk';

const CHAT_MODELS = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "mixtral-8x7b-32768",
    "gemma2-9b-it"
];

const WHISPER_MODELS = [
    "whisper-large-v3",
    "whisper-large-v3-turbo"
];

export class GroqService {
    private client: Groq | null = null;

    initialize(apiKey?: string) {
        const key = apiKey || import.meta.env.VITE_GROQ_API_KEY;
        if (!key) {
            console.warn("Groq API Key missing");
            return;
        }
        this.client = new Groq({
            apiKey: key,
            dangerouslyAllowBrowser: true // Required for client-side usage
        });
    }

    private isModelNotFoundError(err: any): boolean {
        return (
            err?.status === 404 ||
            err?.code === 'model_not_found' ||
            err?.error?.code === 'model_not_found' ||
            (typeof err?.message === 'string' && (
                err.message.includes('does not exist') ||
                err.message.includes('model_not_found') ||
                err.message.includes('do not have access')
            ))
        );
    }

    private async executeChatCompletion(messages: any[], preferredModel: string = "llama-3.1-8b-instant"): Promise<string> {
        if (!this.client) throw new Error("Groq client not initialized");

        const modelsToTry = Array.from(new Set([preferredModel, ...CHAT_MODELS]));
        let lastError: any = null;

        for (const model of modelsToTry) {
            try {
                const completion = await this.client.chat.completions.create({
                    messages,
                    model
                });
                return completion.choices[0]?.message?.content || "";
            } catch (err: any) {
                lastError = err;
                if (this.isModelNotFoundError(err)) {
                    console.warn(`Model '${model}' not available on Groq, trying next available model...`);
                    continue;
                }
                throw err;
            }
        }

        throw lastError || new Error("No compatible Groq chat model could be reached.");
    }

    async transcribeAudio(audioFile: File | Blob): Promise<string> {
        if (!this.client) throw new Error("Groq client not initialized");

        // Convert Blob to File if necessary (Groq SDK expects File)
        const fileToUpload = audioFile instanceof Blob
            ? new File([audioFile], 'audio.mp3', { type: 'audio/mp3' })
            : audioFile;

        let lastError: any = null;

        for (const model of WHISPER_MODELS) {
            try {
                const transcription = await this.client.audio.transcriptions.create({
                    file: fileToUpload,
                    model: model,
                    response_format: "text",
                    language: "es",
                });

                return transcription as unknown as string;
            } catch (error: any) {
                lastError = error;
                if (this.isModelNotFoundError(error)) {
                    console.warn(`Whisper model '${model}' not available, trying fallback...`);
                    continue;
                }
                console.error("Transcription error:", error);
                throw error;
            }
        }

        throw lastError || new Error("Failed to transcribe audio.");
    }

    async analyzeText(text: string, prompt: string, model?: string): Promise<string> {
        if (!this.client) throw new Error("Groq client not initialized");

        const result = await this.executeChatCompletion([
            {
                role: "system",
                content: "Eres un asistente experto en análisis de siniestros para 'Estudio Verax'. Tu tarea es analizar transcripciones de entrevistas."
            },
            {
                role: "user",
                content: `${prompt}\n\nTranscripción:\n${text}`
            }
        ], model || "llama-3.1-8b-instant");

        return result || "No se pudo generar el análisis.";
    }

    async formatAsDialogue(text: string, model?: string): Promise<string> {
        if (!this.client) throw new Error("Groq client not initialized");

        try {
            const formatted = await this.executeChatCompletion([
                {
                    role: "system",
                    content: "Eres un editor experto de transcripciones. Tu tarea es reescribir el siguiente texto plano en formato de diálogo teatral, identificando al 'Entrevistador' y al 'Entrevistado' basándote en el contexto de las preguntas y respuestas. NO resumas, mantén todo el contenido original. Usa el formato:\n\n**Entrevistador**: [Texto]\n\n**Entrevistado**: [Texto]"
                },
                {
                    role: "user",
                    content: `Texto a formatear:\n${text}`
                }
            ], model || "llama-3.1-8b-instant");

            return formatted || text;
        } catch (error) {
            console.error("Format dialogue error (using raw text fallback):", error);
            return text;
        }
    }
}

export const groqService = new GroqService();
