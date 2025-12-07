"use client";

import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserProfile from './UserProfile';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import LoginModal from './LoginModal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { getCartCount } = useCart();
    const [showCart, setShowCart] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const cartCount = getCartCount();
    const { language, changeLanguage, t } = useLanguage();

    const languages = [
        { code: 'pt', flag: '🇧🇷', name: 'Português' },
        { code: 'en', flag: '🇺🇸', name: 'English' },
        { code: 'es', flag: '🇪🇸', name: 'Español' },
        { code: 'ja', flag: '🇯🇵', name: '日本語' },
        { code: 'tl', flag: '🇵🇭', name: 'Tagalog' },
    ];

    const getPageName = (path) => {
        if (path === '/') return t('header.home');
        if (path === '/products') return t('header.products');
        if (path.startsWith('/categories/')) return t('header.category');
        if (path === '/events') return t('header.events');
        if (path === '/partners') return t('header.partners');
        if (path === '/sponsors') return t('header.sponsors');
        if (path.startsWith('/admin')) return t('header.admin');
        return '';
    };

    return (
        <header style={{
            padding: '1rem 2rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            {/* Esquerda: Nome da Página */}
            <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'rgba(255,255,255,0.9)' }}>
                {getPageName(pathname)}
            </div>

            {/* Centro: Nome da Loja */}
            <Link href="/" style={{ textDecoration: 'none', color: 'white', justifySelf: 'center', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="/logo.jpg" alt="Logo" style={{ height: '50px', width: 'auto', borderRadius: '50%', backgroundColor: 'white', padding: '2px' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}>
                    Vanessa Yachiro Personalizados
                </h1>
            </Link>

            {/* Direita: Idioma + Carrinho + Perfil */}
            <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifySelf: 'end' }}>
                {/* Language Selector */}
                <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                    title="Select Language"
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code} style={{ color: 'black' }}>
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>

                {/* Cart Icon */}
                <button
                    onClick={() => setShowCart(true)}
                    style={{
                        position: 'relative',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        padding: '0.5rem',
                        color: 'white'
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
                    <button onClick={() => setShowLoginModal(true)} className="btn btn-primary">
                        Entrar
                    </button>
                )}
            </nav>

            {/* Cart Drawer */}
            <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />

            {/* Login Modal */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </header>
    );
}
