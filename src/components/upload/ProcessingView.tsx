import React from 'react';
import { Loader2, CheckCircle2, FileAudio, FileText, BrainCircuit } from 'lucide-react';

interface ProcessingViewProps {
    status: 'extracting' | 'transcribing' | 'formatting' | 'analyzing' | 'completed';
    progress: number; // 0-100
    fileName: string;
}

const steps = [
    { id: 'extracting', label: 'Extrayendo Audio', icon: FileAudio },
    { id: 'transcribing', label: 'Transcribiendo', icon: FileText },
    { id: 'formatting', label: 'Diarizando (IA)', icon: BrainCircuit },
    { id: 'analyzing', label: 'Analizando Datos', icon: BrainCircuit },
];

export const ProcessingView: React.FC<ProcessingViewProps> = ({ status, progress, fileName }) => {
    const currentStepIndex = steps.findIndex(s => s.id === status);

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Procesando: {fileName}</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
                Por favor no cierres esta pestaña.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
                {/* Progress Bar Background */}
                <div style={{
                    position: 'absolute',
                    top: '24px',
                    left: '0',
                    right: '0',
                    height: '2px',
                    backgroundColor: 'var(--color-border)',
                    zIndex: 0
                }} />

                {/* Active Progress Bar (Simple approximation) */}
                <div style={{
                    position: 'absolute',
                    top: '24px',
                    left: '0',
                    width: `${((currentStepIndex) / (steps.length - 1)) * 100}%`,
                    height: '2px',
                    backgroundColor: 'var(--color-primary)',
                    zIndex: 0,
                    transition: 'width 0.5s ease'
                }} />

                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex || status === 'completed';
                    const Icon = step.icon;

                    return (
                        <div key={step.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backgroundColor: isActive || isCompleted ? 'var(--color-primary)' : 'var(--color-surface)',
                                border: `2px solid ${isActive || isCompleted ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isActive || isCompleted ? 'white' : 'var(--color-text-muted)',
                                transition: 'all 0.3s ease'
                            }}>
                                {isActive ? <Loader2 className="spin" size={24} /> : isCompleted ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                            </div>
                            <span style={{
                                fontSize: '0.875rem',
                                fontWeight: isActive ? '600' : '400',
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'
                            }}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {status === 'extracting' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        <span>Extracción local (FFmpeg)</span>
                        <span>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.2s linear' }} />
                    </div>
                </div>
            )}

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};
