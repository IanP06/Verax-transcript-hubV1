import React from 'react';

export const Navbar: React.FC = () => {
    return (
        <nav style={{
            height: '64px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 2rem',
            backgroundColor: 'var(--color-surface)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <img src="/verax-logo.jpg" alt="Verax Logo" style={{ height: '40px' }} />
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-main)', lineHeight: 1 }}>Verax Transcript Hub</h1>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Análisis Inteligente de Siniestros</span>
                </div>
            </div>
        </nav>
    );
};
