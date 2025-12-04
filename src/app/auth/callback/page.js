"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        // Close popup window after successful auth
        if (window.opener) {
            // This is a popup window
            window.opener.postMessage('login-success', window.location.origin);
            window.close();
        } else {
            // Fallback: redirect to home if not in popup
            router.push('/');
        }
    }, [router]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div style={{ fontSize: '2rem' }}>✓</div>
            <p>Login realizado com sucesso!</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                Esta janela fechará automaticamente...
            </p>
        </div>
    );
}
