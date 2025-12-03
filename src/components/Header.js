"use client";

import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';
import UserProfile from './UserProfile';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header style={{
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--background)',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    Loja Personalizada
                </h1>
            </Link>
            <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {session ? (
                    <UserProfile />
                ) : (
                    <button onClick={() => signIn('google')} className="btn btn-primary">
                        Entrar
                    </button>
                )}
            </nav>
        </header>
    );
}
