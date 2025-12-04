"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function LoginModal({ isOpen, onClose }) {
    useEffect(() => {
        // Listen for login completion message from popup
        const handleMessage = (event) => {
            if (event.data === 'login-success') {
                onClose();
                window.location.reload(); // Refresh to update session
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onClose]);

    if (!isOpen) return null;

    const handleGoogleLogin = () => {
        // Calculate popup position (centered)
        const width = 500;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        // Build the OAuth URL with popup redirect
        const callbackUrl = encodeURIComponent(window.location.origin + '/auth/callback');
        const authUrl = `/api/auth/signin/google?callbackUrl=${callbackUrl}`;

        // Open in popup window
        const popup = window.open(
            authUrl,
            'GoogleLogin',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            alert('Por favor, permita popups para este site para fazer login.');
            return;
        }

        // Monitor popup for closure
        const checkPopup = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    onClose();
                    // Reload to get updated session
                    setTimeout(() => {
                        window.location.reload();
                    }, 300);
                }
            } catch (e) {
                // Cross-origin error is expected
            }
        }, 500);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--background)',
                padding: '2rem',
                borderRadius: 'var(--radius)',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                position: 'relative',
                border: '1px solid var(--border)'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: 'var(--muted-foreground)'
                    }}
                >
                    &times;
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bem-vindo!</h2>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        Faça login para acessar sua conta, ver seus pedidos e muito mais.
                    </p>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        backgroundColor: '#fff',
                        color: '#333',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
                    Continuar com Google
                </button>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                    O login abrirá em uma janela popup pequena.
                </div>
            </div>
        </div>
    );
}
