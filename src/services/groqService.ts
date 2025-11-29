import Groq from 'groq-sdk';

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

    async transcribeAudio(audioFile: File | Blob): Promise<string> {
        if (!this.client) throw new Error("Groq client not initialized");

        // Convert Blob to File if necessary (Groq SDK expects File)
        const fileToUpload = audioFile instanceof Blob
            ? new File([audioFile], 'audio.mp3', { type: 'audio/mp3' })
            : audioFile;

        try {
            const transcription = await this.client.audio.transcriptions.create({
                file: fileToUpload,
                model: "whisper-large-v3",
                response_format: "text", // or "json" for timestamps
                language: "es", // Spanish
            });

            return transcription as unknown as string; // Type assertion as response_format: text returns string
        } catch (error) {
            console.error("Transcription error:", error);
            throw error;
        }
    }

    async analyzeText(text: string, prompt: string): Promise<string> {
        if (!this.client) throw new Error("Groq client not initialized");

        const completion = await this.client.chat.completions.create({
            messages: [
                { role: "system", content: "Eres un asistente experto en análisis de siniestros para 'Estudio Verax'. Tu tarea es analizar transcripciones de entrevistas." },
                { role: "user", content: `${prompt}\n\nTranscripción:\n${text}` }
            ],
            model: "llama-3.3-70b-versatile", // Use a large language model for analysis
        });

        return completion.choices[0]?.message?.content || "No se pudo generar el análisis.";
    }

    async formatAsDialogue(text: string): Promise<string> {
        if (!this.client) throw new Error("Groq client not initialized");

        const completion = await this.client.chat.completions.create({
            messages: [
                { role: "system", content: "Eres un editor experto de transcripciones. Tu tarea es reescribir el siguiente texto plano en formato de diálogo teatral, identificando al 'Entrevistador' y al 'Entrevistado' basándote en el contexto de las preguntas y respuestas. NO resumas, mantén todo el contenido original. Usa el formato:\n\n**Entrevistador**: [Texto]\n\n**Entrevistado**: [Texto]" },
                { role: "user", content: `Texto a formatear:\n${text}` }
            ],
            model: "llama-3.3-70b-versatile",
        });

        return completion.choices[0]?.message?.content || text;
    }
}

export const groqService = new GroqService();
