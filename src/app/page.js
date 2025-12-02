"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
    const { data: session } = useSession();

    return (
        <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
            <h1>Site Reiniciado</h1>
            <p>Estrutura limpa e pronta para o novo projeto.</p>

            {session ? (
                <div style={{ textAlign: 'center' }}>
                    <p>Logado como: {session.user.email}</p>
                    <button onClick={() => signOut()} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Sair</button>
                </div>
            ) : (
                <button onClick={() => signIn('google')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    Entrar com Google
                </button>
            )}
        </main>
    );
}
