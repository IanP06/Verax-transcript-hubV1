import React, { useState } from 'react';
import { UploadZone } from '../components/upload/UploadZone';
import { ProcessingView } from '../components/upload/ProcessingView';
import { ffmpegService } from '../services/ffmpegService';
import { groqService } from '../services/groqService';
import { exportService } from '../services/exportService';
import { FileDown } from 'lucide-react';

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
                        <button className="btn btn-secondary" onClick={() => performAnalysis('Genera un resumen ejecutivo de este siniestro.')}>
                            Generar Resumen
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
