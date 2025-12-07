"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function UserProfile() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!session?.user) return null;

    const isAdmin = session.user.role === 'admin';

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    color: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                {session.user.image && (
                    <img
                        src={session.user.image}
                        alt={session.user.name}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: isAdmin ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,0.5)'
                        }}
                    />
                )}
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {session.user.name}
                    </div>
                    {isAdmin && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                            Admin
                        </div>
                    )}
                </div>
                <span style={{ fontSize: '0.75rem' }}>▼</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                    zIndex: 50
                }}>
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                            {session.user.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                            {session.user.email}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            signOut();
                            setIsOpen(false);
                        }}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            textAlign: 'left',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        🚪 Sair
                    </button>
                </div>
            )}
        </div>
    );
}
