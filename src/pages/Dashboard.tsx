import React, { useState } from 'react';
import { UploadZone } from '../components/upload/UploadZone';
import { ProcessingView } from '../components/upload/ProcessingView';
import { ffmpegService } from '../services/ffmpegService';
import { groqService } from '../services/groqService';
import { exportService } from '../services/exportService';
import { FileDown } from 'lucide-react';

const EXECUTIVE_SUMMARY_PROMPT = `Necesito que proceses esta entrevista y redactes un detalle completo de la declaración del entrevistado, con un formato uniforme y técnico, aplicable a siniestros de tránsito, robos (totales o parciales), incendios o daños materiales.
El texto debe organizarse según la siguiente estructura y normas:

Estructura del Informe de Declaración:

Identificación del siniestro:
Número de siniestro, fecha, lugar de ocurrencia, tipo de siniestro (choque, robo, incendio, daño), vehículo o bien asegurado, asegurado, póliza, y cualquier otro dato relevante de identificación.

Contexto previo al hecho:
Situación general previa (viaje, rutina, actividad, uso del bien, horario, acompañantes, circunstancias del entorno). En caso de robo o incendio, indicar cómo y dónde se encontraba el bien o la persona asegurada.

Circunstancias previas al evento:
Condiciones de tránsito, climáticas o del entorno, estado del lugar, maniobras previas (en siniestros viales), medidas de seguridad adoptadas (en robos/incendios), manifestaciones o conductas previas del asegurado.

Descripción del hecho o evento:
Relato cronológico y completo de cómo ocurrió el siniestro.

En choques: mecánica del accidente, puntos de impacto, daños visibles, intervención de terceros.

En robos: modalidad del hecho (violencia, forzamiento, descuido, etc.), elementos sustraídos, participación policial.

En incendios: origen presunto, propagación, daños ocasionados, intervención de bomberos.

En daños materiales: circunstancias del daño, causas posibles, momento de detección.

Consecuencias inmediatas:
Lesiones, asistencia médica, denuncia policial, intervención de bomberos, remolque o grúa, traslado, medidas adoptadas luego del hecho.

Manifestaciones sobre terceros o testigos:
Identificación de otras personas involucradas (conductores, acompañantes, testigos, vecinos, personal policial o de emergencias). Descripción de su participación o testimonio.

Otros detalles relevantes:
Comentarios adicionales, aclaraciones del entrevistado, observaciones sobre documentación, reparaciones, compras, actuaciones posteriores, percepciones o valoraciones personales.

Conclusión preliminar sobre la declaración:
Evaluación técnica de la coherencia, consistencia y correspondencia del relato con los daños o evidencias verificables. Considerar si resulta verosímil, incompleta, o inconsistente; indicar si surgen indicios de fraude o no, conforme a lo dispuesto por la Ley 17.418 (arts. 46-48)`;

const ACTA_DECLARATORIA_PROMPT = `1. Redactar acta declaratoria del entrevistado a partir de la transcripción.

2. La narración debe redactarse en tercera persona, estilo formal, administrativo, sin opiniones ni interpretación subjetiva. Comenzando siempre cada párrafo con un "Que,..."seguido de una coma o descripción directa; funciona como conector administrativo, por lo que es obligatorio para mantener el estilo del acta. Ejemplo:
“Que posteriormente…”
 
“Que el asegurado indicó…”

“Que durante la entrevista…”

“Que la unidad presentaba…”

Etc.

3. El relato de los hechos debe ser:

Ordenado cronológicamente.

Claro, completo y coherente.

Sin repeticiones, sin muletillas, sin referencias textuales a diálogos (“me dijo”, “yo dije”, etc.).

Siempre transformando la conversación del .txt en un relato formal.

4. Debe incluir, según corresponda:

Descripción de los hechos del siniestro.

Lugar, fecha, horario aproximado.

Si hubo robo: sustraído, modalidad, cuántos delincuentes, armas, etc.

Si hubo choque: dirección, posición de los vehículos, daños, intercambios de datos.

Datos del vehículo: kilometraje, uso habitual, llaves, estado previo.

Si intervino policía, 911, Strix, aplicación, etc.

Si es un caso de aplicación (Uber, Didi, Rappi), mencionar rol y si hizo o no denuncia en la plataforma.

5. Nunca inventar datos que no estén en el relato.

6. Nunca copiar frases textuales de la entrevista; siempre reformular en estilo de acta.

7. Nunca incluir preguntas ni respuestas; solo el relato final.`;

export const Dashboard: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'extracting' | 'transcribing' | 'formatting' | 'analyzing' | 'completed'>('idle');
    const [progress, setProgress] = useState(0);
    const [transcription, setTranscription] = useState<string>('');
    const [apiKey] = useState(import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('groq_api_key') || '');
    const [analysisResult, setAnalysisResult] = useState<string>('');

    const handleFileSelect = async (selectedFile: File) => {
        if (!apiKey) {
            alert('API Key no configurada. Contacte al administrador.');
            return;
        }

        setFile(selectedFile);
        setStatus('extracting');
        setProgress(0);
        setAnalysisResult('');

        try {
            groqService.initialize(apiKey);

            let audioBlob: Blob | File = selectedFile;

            // If video, extract audio first
            if (selectedFile.type.startsWith('video/')) {
                audioBlob = await ffmpegService.extractAudio(selectedFile, (prog) => {
                    setProgress(prog);
                });
            }

            setStatus('transcribing');
            const rawText = await groqService.transcribeAudio(audioBlob);

            setStatus('formatting');
            const formattedText = await groqService.formatAsDialogue(rawText);

            setTranscription(formattedText);
            setStatus('completed');
        } catch (error: any) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`Error: ${errorMessage}`);
            setStatus('idle');
        }
    };

    const performAnalysis = async (prompt: string) => {
        if (!transcription) return;
        setAnalysisResult('Analizando...');
        try {
            const result = await groqService.analyzeText(transcription, prompt);
            setAnalysisResult(result);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setAnalysisResult(`Error al analizar: ${errorMessage}`);
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Panel de Control</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Sube tus grabaciones para comenzar el análisis.</p>
                </div>
            </header>

            {status === 'idle' ? (
                <UploadZone onFileSelect={handleFileSelect} />
            ) : status === 'completed' ? (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Transcripción Completada</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-ghost" onClick={() => exportService.downloadTXT(transcription, `transcripcion-${file?.name}`)}>
                                <FileDown size={16} /> TXT
                            </button>
                            <button className="btn btn-ghost" onClick={() => exportService.downloadPDF(transcription, `transcripcion-${file?.name}`)}>
                                <FileDown size={16} /> PDF
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" onClick={() => performAnalysis(EXECUTIVE_SUMMARY_PROMPT)}>
                            Generar Informe Técnico
                        </button>
                        <button className="btn btn-secondary" onClick={() => performAnalysis(ACTA_DECLARATORIA_PROMPT)}>
                            Generar Acta Declaratoria
                        </button>
                        <button className="btn btn-secondary" onClick={() => performAnalysis('Extrae una cronología detallada de los hechos con horas y eventos.')}>
                            Extraer Cronología
                        </button>
                        <button className="btn btn-secondary" onClick={() => performAnalysis('Genera una estructura de mapa mental en formato markdown lista.')}>
                            Mapa Mental
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Texto Transcrito (Diarizado)</h4>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--color-text-main)', maxHeight: '500px', overflowY: 'auto', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                                {transcription}
                            </div>
                        </div>

                        {analysisResult && (
                            <div className="fade-in">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontWeight: '600' }}>Resultado del Análisis</h4>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(analysisResult);
                                            alert('Copiado al portapapeles');
                                        }}
                                    >
                                        <FileDown size={14} style={{ marginRight: '4px' }} /> Copiar
                                    </button>
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--color-text-main)', maxHeight: '500px', overflowY: 'auto', padding: '1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
                                    {analysisResult}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => { setStatus('idle'); setAnalysisResult(''); setTranscription(''); }}>
                        Procesar otro archivo
                    </button>
                </div>
            ) : (
                <ProcessingView status={status} progress={progress} fileName={file?.name || ''} />
            )}
        </div>
    );
};
