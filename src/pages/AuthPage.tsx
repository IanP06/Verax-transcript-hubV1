import React from 'react';

export const AuthPage: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-secondary)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', fontWeight: 'bold' }}>VeraxFlow</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Iniciar Sesión</p>
                </div>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
                        <input type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} placeholder="usuario@estudioverax.com" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Contraseña</label>
                        <input type="password" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} placeholder="••••••••" />
                    </div>

                    <button type="button" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};
