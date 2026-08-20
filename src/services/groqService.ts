import Groq from 'groq-sdk';

// Prioritized fallback models currently active on Groq
const FALLBACK_CHAT_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "moonshotai/kimi-k2-instruct",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant"
];

const WHISPER_MODELS = [
    "whisper-large-v3-turbo",
    "whisper-large-v3"
];

export class GroqService {
    private client: Groq | null = null;
    private availableChatModels: string[] = [];
    private lastModelFetchTime: number = 0;

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

    private isModelUnavailableError(err: any): boolean {
        const status = err?.status || err?.statusCode || err?.error?.status;
        const code = err?.code || err?.error?.code;
        const message = (err?.message || err?.error?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || '').toLowerCase();

        if (status === 404 || code === 'model_not_found' || code === 'model_decommissioned') {
            return true;
        }

        return (
            message.includes('decommissioned') ||
            message.includes('deprecated') ||
            message.includes('model_not_found') ||
            message.includes('does not exist') ||
            message.includes('do not have access') ||
            message.includes('not available') ||
            message.includes('no longer supported') ||
            message.includes('is not supported') ||
            message.includes('unknown model') ||
            message.includes('invalid_model')
        );
    }

    private async refreshAvailableModels(): Promise<string[]> {
        const now = Date.now();
        if (this.availableChatModels.length > 0 && (now - this.lastModelFetchTime) < 1000 * 60 * 10) {
            return this.availableChatModels;
        }

        if (!this.client) return FALLBACK_CHAT_MODELS;

        try {
            const list = await this.client.models.list();
            const models = (list.data || [])
                .filter(m => (m as any).active !== false)
                .map(m => m.id)
                .filter(id =>
                    !id.includes('whisper') &&
                    !id.includes('guard') &&
                    !id.includes('safeguard') &&
                    !id.includes('reranker') &&
                    !id.includes('orpheus') &&
                    !id.includes('vision')
                );

            if (models.length > 0) {
                const prioritized = [
                    ...FALLBACK_CHAT_MODELS.filter(m => models.includes(m)),
                    ...models.filter(m => !FALLBACK_CHAT_MODELS.includes(m))
                ];
                this.availableChatModels = prioritized;
                this.lastModelFetchTime = now;
                return this.availableChatModels;
            }
        } catch (e) {
            console.warn("Could not dynamically query Groq models list, falling back to static list.", e);
        }

        return FALLBACK_CHAT_MODELS;
    }

    private async executeChatCompletion(messages: any[], preferredModel?: string): Promise<string> {
        if (!this.client) throw new Error("Groq client not initialized");

        const availableModels = await this.refreshAvailableModels();
        const preferred = preferredModel || availableModels[0] || FALLBACK_CHAT_MODELS[0];
        const modelsToTry = Array.from(new Set([preferred, ...availableModels, ...FALLBACK_CHAT_MODELS]));
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
                if (this.isModelUnavailableError(err)) {
                    console.warn(`Model '${model}' not available on Groq, trying next available model...`, err?.message || err);
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
                if (this.isModelUnavailableError(error)) {
                    console.warn(`Whisper model '${model}' not available, trying fallback...`, error?.message || error);
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
        ], model);

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
            ], model);

            return formatted || text;
        } catch (error) {
            console.error("Format dialogue error (using raw text fallback):", error);
            return text;
        }
    }
}

export const groqService = new GroqService();
