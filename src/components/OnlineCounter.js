"use client";

import { useOnlineUsers } from '@/hooks/useOnlineUsers';

export default function OnlineCounter() {
    const { count, loading } = useOnlineUsers();

    if (loading) {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '999px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#4ade80',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <span>...</span>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '999px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                cursor: 'help',
                transition: 'transform 0.2s'
            }}
            title="Usuários online agora"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4ade80',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span style={{ fontWeight: '600' }}>{count}</span>
            <span style={{ opacity: 0.9 }}>online</span>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
}
