"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useView } from '@/contexts/ViewContext';
import CartDrawer from './CartDrawer';
import LoginModal from './LoginModal';

export default function MobileLayout({ children }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { getCartCount } = useCart();
    const [showCart, setShowCart] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const cartCount = getCartCount();
    const { toggleViewMode } = useView();

    const isActive = (path) => pathname === path || pathname.startsWith(path);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            paddingBottom: '70px' // Space for bottom nav
        }}>
            {/* Simplified Mobile Header */}
            <header style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Menu Button */}
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    ☰
                </button>

                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
                    <img src="/logo.jpg" alt="Logo" style={{
                        height: '40px',
                        width: 'auto',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        padding: '2px'
                    }} />
                </Link>

                {/* View Toggle Button */}
                <button
                    onClick={toggleViewMode}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 'var(--radius)',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        color: 'white'
                    }}
                    title="Mudar para versão Desktop"
                >
                    💻
                </button>

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
                >
                    🛒
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'var(--primary)',
                            color: 'white',
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
            </header>

            {/* Side Menu Drawer */}
            {showMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 100
                    }}
                    onClick={() => setShowMenu(false)}
                >
                    <div
                        style={{
                            width: '80%',
                            maxWidth: '300px',
                            height: '100%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            padding: '2rem 1rem',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ color: 'white', marginBottom: '2rem' }}>Menu</h2>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link href="/" style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '0.75rem',
                                background: isActive('/') && pathname === '/' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                borderRadius: 'var(--radius)'
                            }} onClick={() => setShowMenu(false)}>
                                🏠 Início
                            </Link>
                            <Link href="/products" style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '0.75rem',
                                background: isActive('/products') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                borderRadius: 'var(--radius)'
                            }} onClick={() => setShowMenu(false)}>
                                🛍️ Produtos
                            </Link>
                            <Link href="/events" style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '0.75rem',
                                background: isActive('/events') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                borderRadius: 'var(--radius)'
                            }} onClick={() => setShowMenu(false)}>
                                📅 Eventos
                            </Link>
                            <Link href="/promotions" style={{
                                color: 'white',
                                textDecoration: 'none',
                                padding: '0.75rem',
                                background: isActive('/promotions') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                borderRadius: 'var(--radius)'
                            }} onClick={() => setShowMenu(false)}>
                                🔥 Promoções
                            </Link>

                            {/* Admin Menu Section */}
                            {session?.user?.role === 'admin' && (
                                <>
                                    <div style={{
                                        height: '1px',
                                        background: 'rgba(255,255,255,0.3)',
                                        margin: '1rem 0'
                                    }} />
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.7)',
                                        marginBottom: '0.5rem',
                                        paddingLeft: '0.75rem'
                                    }}>
                                        ⚡ ADMIN
                                    </div>
                                    <Link href="/admin/users" style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        padding: '0.75rem',
                                        background: isActive('/admin/users') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }} onClick={() => setShowMenu(false)}>
                                        👥 Clientes
                                    </Link>
                                    <Link href="/admin/orders" style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        padding: '0.75rem',
                                        background: isActive('/admin/orders') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }} onClick={() => setShowMenu(false)}>
                                        📦 Pedidos
                                    </Link>
                                    <Link href="/admin/products" style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        padding: '0.75rem',
                                        background: isActive('/admin/products') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }} onClick={() => setShowMenu(false)}>
                                        🛍️ Produtos
                                    </Link>
                                    <Link href="/admin/galeria" style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        padding: '0.75rem',
                                        background: isActive('/admin/galeria') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }} onClick={() => setShowMenu(false)}>
                                        🖼️ Galeria
                                    </Link>
                                    <Link href="/admin/coupons" style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        padding: '0.75rem',
                                        background: isActive('/admin/coupons') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }} onClick={() => setShowMenu(false)}>
                                        🎟️ Cupons
                                    </Link>
                                    <Link href="/admin/events" style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        padding: '0.75rem',
                                        background: isActive('/admin/events') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }} onClick={() => setShowMenu(false)}>
                                        📅 Eventos
                                    </Link>
                                    <Link href="/admin/ads" style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        padding: '0.75rem',
                                        background: isActive('/admin/ads') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }} onClick={() => setShowMenu(false)}>
                                        📢 Propagandas
                                    </Link>
                                    <Link href="/admin/settings" style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        padding: '0.75rem',
                                        background: isActive('/admin/settings') ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        borderRadius: 'var(--radius)'
                                    }} onClick={() => setShowMenu(false)}>
                                        ⚙️ Config
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                padding: '0.5rem',
                zIndex: 50
            }}>
                <Link href="/" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: isActive('/') && pathname === '/' ? 'var(--accent)' : 'white',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    padding: '0.5rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>🏠</span>
                    Início
                </Link>

                <Link href="/products" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: isActive('/products') ? 'var(--accent)' : 'white',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    padding: '0.5rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                    Produtos
                </Link>

                <button
                    onClick={() => setShowCart(true)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'white',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.75rem',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>🛒</span>
                    Carrinho
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '0.25rem',
                            right: '1.5rem',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </button>

                {session ? (
                    <button
                        onClick={() => router.push('/profile')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: isActive('/profile') ? 'var(--accent)' : 'white',
                            background: 'none',
                            border: 'none',
                            fontSize: '0.75rem',
                            padding: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>👤</span>
                        Perfil
                    </button>
                ) : (
                    <button
                        onClick={() => setShowLoginModal(true)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: 'white',
                            background: 'none',
                            border: 'none',
                            fontSize: '0.75rem',
                            padding: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>🔐</span>
                        Entrar
                    </button>
                )}
            </nav>

            {/* Cart Drawer */}
            <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />

            {/* Login Modal */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
    );
}
