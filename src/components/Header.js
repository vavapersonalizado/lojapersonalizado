"use client";

import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserProfile from './UserProfile';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import CartDrawer from './CartDrawer';

export default function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { getCartCount } = useCart();
    const [showCart, setShowCart] = useState(false);
    const cartCount = getCartCount();

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

            {/* Direita: Carrinho + Perfil */}
            <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifySelf: 'end' }}>
                {/* Cart Icon */}
                <button
                    onClick={() => setShowCart(true)}
                    style={{
                        position: 'relative',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        padding: '0.5rem'
                    }}
                    title="Carrinho"
                >
                    🛒
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </button>

                {session ? (
                    <UserProfile />
                ) : (
                    <button onClick={() => signIn('google')} className="btn btn-primary">
                        Entrar
                    </button>
                )}
            </nav>

            {/* Cart Drawer */}
            <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
        </header>
    );
}
