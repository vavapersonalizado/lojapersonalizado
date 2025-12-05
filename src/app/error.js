'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Algo deu errado!</h2>
            <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '500px' }}>
                Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        background: '#0070f3',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Tentar novamente
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        background: '#f5f5f5',
                        color: '#333',
                        border: '1px solid #ddd',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Voltar para Home
                </button>
            </div>
        </div>
    );
}
