"use client";

import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserProfile from './UserProfile';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import CartDrawer from './CartDrawer';
import LoginModal from './LoginModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useView } from '@/contexts/ViewContext';

import { useTheme } from '@/contexts/ThemeContext';
import NotificationBell from './NotificationBell';

export default function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { getCartCount } = useCart();
    const [showCart, setShowCart] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const cartCount = getCartCount();
    const { language, changeLanguage, t } = useLanguage();
    const { viewMode, toggleViewMode } = useView();

    const { theme } = useTheme();
    const [randomIcons, setRandomIcons] = useState({ cart: '🛒', mobile: '📱', desktop: '💻' });

    useEffect(() => {
        if (theme?.icons) {
            setRandomIcons({
                cart: theme.icons.cart?.[Math.floor(Math.random() * theme.icons.cart.length)] || '🛒',
                mobile: theme.icons.mobile?.[Math.floor(Math.random() * theme.icons.mobile.length)] || '📱',
                desktop: theme.icons.desktop?.[Math.floor(Math.random() * theme.icons.desktop.length)] || '💻'
            });
        }
    }, [theme]);

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
        <header className="glass" style={{
            padding: '1rem 2rem',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: 'var(--glass-border)',
            background: 'var(--headerBg, rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(12px)'
        }}>
            {/* Esquerda: Nome da Página */}
            <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--foreground)',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.05em'
            }}>
                {getPageName(pathname)}
            </div>

            {/* Centro: Nome da Loja */}
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', justifySelf: 'center', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    padding: '2px',
                    background: 'var(--gradient-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img src="/logo.jpg" alt="Logo" style={{ height: '48px', width: '48px', borderRadius: '50%', border: '2px solid var(--background)' }} />
                </div>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em'
                }}>
                    Vanessa Yachiro
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
                        border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--foreground)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        outline: 'none'
                    }}
                    title="Select Language"
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code} style={{ color: 'black' }}>
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>

                {/* View Mode Toggle */}
                <button
                    onClick={toggleViewMode}
                    className="btn btn-outline"
                    style={{
                        padding: '0.5rem',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px'
                    }}
                    title={viewMode === 'mobile' ? 'Mudar para versão Desktop' : 'Mudar para versão Mobile'}
                >
                    {viewMode === 'mobile' ? randomIcons.desktop : randomIcons.mobile}
                </button>

                {/* Notification Bell */}
                <NotificationBell />

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
                        color: 'var(--foreground)',
                        transition: 'transform 0.2s ease'
                    }}
                    title="Carrinho"
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {randomIcons.cart}
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
