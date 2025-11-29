import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '2rem 0' }}>
                <div className="container">
                    <Outlet />
                </div>
            </main>
            <footer style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem',
                borderTop: '1px solid var(--color-border)',
                marginTop: 'auto'
            }}>
                © {new Date().getFullYear()} Estudio Verax. Todos los derechos reservados.
            </footer>
        </div>
    );
};
