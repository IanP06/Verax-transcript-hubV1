import React, { useCallback, useState } from 'react';
import { UploadCloud, FileVideo, FileAudio } from 'lucide-react';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    }, [onFileSelect]);

    return (
        <div
            className={`card ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: isDragging ? 'rgba(185, 54, 50, 0.05)' : 'var(--color-surface)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}
        >
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileInput}
                accept="video/*,audio/*"
            />

            <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--color-background)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                color: 'var(--color-primary)'
            }}>
                <UploadCloud size={40} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Sube o arrastra tu archivo aquí
            </h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', marginBottom: '2rem' }}>
                Soporta MP4, MKV, MP3, OGG, AVI. Procesamiento local seguro para archivos grandes.
            </p>

            <label htmlFor="file-upload" className="btn btn-primary">
                <FileVideo size={20} />
                Seleccionar Archivo
            </label>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileVideo size={16} /> Videos hasta 2GB
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileAudio size={16} /> Audios ilimitados
                </div>
            </div>
        </div>
    );
};
