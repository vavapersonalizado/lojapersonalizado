"use client";

import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserProfile from './UserProfile';

export default function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const getPageName = (path) => {
        if (path === '/') return 'Início';
        if (path === '/products') return 'Produtos';
        if (path.startsWith('/categories/')) return 'Categoria';
        if (path === '/events') return 'Eventos';
        if (path === '/partners') return 'Parceiros';
        if (path === '/sponsors') return 'Patrocinadores';
        if (path.startsWith('/admin')) return 'Admin';
        return '';
    };

    return (
        <header style={{
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            background: 'var(--background)',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            {/* Esquerda: Nome da Página */}
            <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--muted-foreground)' }}>
                {getPageName(pathname)}
            </div>

            {/* Centro: Nome da Loja */}
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', justifySelf: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}>
                    Vanessa Yachiro Personalizados
                </h1>
            </Link>

            {/* Direita: Perfil */}
            <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifySelf: 'end' }}>
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
