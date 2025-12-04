"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCallback() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    useEffect(() => {
        // If there's an error, don't close the popup
        if (error) {
            console.error('Auth error:', error);
            return;
        }

        // Check if this is a popup window
        if (window.opener && !window.opener.closed) {
            try {
                // Send message to parent window
                window.opener.postMessage('login-success', window.location.origin);

                // Close this popup after a short delay
                setTimeout(() => {
                    window.close();
                }, 500);
            } catch (e) {
                console.error('Error closing popup:', e);
                // Fallback: just close the window
                setTimeout(() => {
                    window.close();
                }, 1000);
            }
        } else {
            // Not a popup, redirect to home
            window.location.href = '/';
        }
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '1rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {error ? (
                <>
                    <div style={{ fontSize: '3rem' }}>❌</div>
                    <h2>Erro no login</h2>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        {error === 'OAuthAccountNotLinked'
                            ? 'Esta conta já está vinculada a outro método de login.'
                            : 'Ocorreu um erro. Tente novamente.'}
                    </p>
                    <button
                        onClick={() => window.close()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Fechar
                    </button>
                </>
            ) : (
                <>
                    <div style={{ fontSize: '3rem' }}>✓</div>
                    <h2>Login realizado com sucesso!</h2>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Esta janela fechará automaticamente...
                    </p>
                </>
            )}
        </div>
    );
}
