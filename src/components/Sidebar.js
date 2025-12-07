"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    // Debug logging
    console.log('Sidebar - Session:', session);
    console.log('Sidebar - isAdmin:', isAdmin);

    const [settings, setSettings] = useState({
        showProducts: true,
        showCategories: true,
        showEvents: true,
        showPartners: true,
        showSponsors: true
    });
    const [categories, setCategories] = useState([]);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isClientMode, setIsClientMode] = useState(false);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error(err));

        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    console.error('Invalid categories data:', data);
                    setCategories([]);
                }
            })
            .catch(err => {
                console.error(err);
                setCategories([]);
            });
    }, []);

    const toggleSetting = async (key) => {
        if (!isAdmin) return;

        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);

        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: newSettings[key] })
            });
        } catch (error) {
            console.error('Error updating settings:', error);
            // Revert on error
            setSettings(settings);
        }
    };

    const toggleCategoryVisibility = async (categoryId, currentVisibility) => {
        if (!isAdmin) return;

        // Optimistic update
        const updatedCategories = categories.map(cat =>
            cat.id === categoryId ? { ...cat, visible: !currentVisibility } : cat
        );
        setCategories(updatedCategories);

        try {
            await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: categoryId, visible: !currentVisibility })
            });
        } catch (error) {
            console.error('Error updating category visibility:', error);
            // Revert on error
            setCategories(categories);
        }
    };

    // Filter categories for display
    const visibleCategories = categories.filter(cat => isAdmin || cat.visible !== false);

    const menuItems = [
        { name: 'Produtos', path: '/products', settingKey: 'showProducts' },
        {
            name: 'Categorias',
            path: '#',
            settingKey: 'showCategories',
            hasSubmenu: true,
            isOpen: isCategoriesOpen,
            toggle: () => setIsCategoriesOpen(!isCategoriesOpen),
            submenu: visibleCategories.map(cat => ({
                id: cat.id,
                name: cat.name,
                path: `/products?category=${cat.id}`, // Note: This path might need adjustment if using /categories/[slug]
                slug: cat.slug,
                visible: cat.visible
            }))
        },
        { name: 'Eventos', path: '/events', settingKey: 'showEvents' },
        { name: 'Promoções', path: '/promotions', settingKey: 'showPromotions' }, // Added to client menu
        { name: 'Parceiros', path: '/partners', settingKey: 'showPartners' },
        { name: 'Patrocinadores', path: '/sponsors', settingKey: 'showSponsors' },
    ];

    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className="glass" style={{
            width: isCollapsed ? '80px' : '260px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: 'white',
            borderRight: '1px solid var(--border)',
            padding: '1rem 0.5rem',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
            zIndex: 50
        }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {!isCollapsed && (
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'Outfit, sans-serif' }}>
                        Menu
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius)',
                        color: 'white',
                        margin: isCollapsed ? '0 auto' : '0'
                    }}
                >
                    {isCollapsed ? '➡️' : '⬅️'}
                </button>
            </div>

            {isAdmin && (
                <>
                    <div style={{
                        display: 'flex',
                        flexDirection: isCollapsed ? 'column' : 'row',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        marginBottom: '1rem',
                        gap: '0.5rem'
                    }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--primary)',
                            background: 'rgba(124, 58, 237, 0.1)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius)',
                            whiteSpace: 'nowrap',
                            display: isCollapsed ? 'none' : 'block'
                        }}>
                            ⚡ Modo Admin
                        </div>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            color: 'var(--muted-foreground)',
                            justifyContent: isCollapsed ? 'center' : 'flex-start'
                        }}>
                            <input
                                type="checkbox"
                                checked={isClientMode}
                                onChange={(e) => setIsClientMode(e.target.checked)}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            {!isCollapsed && 'Cliente'}
                        </label>
                    </div>

                    {!isClientMode && (
                        <>
                            {[
                                { name: 'Clientes', path: '/admin/users', icon: '👥' },
                                { name: 'Pedidos', path: '/admin/orders', icon: '📦' },
                                { name: 'Produtos', path: '/admin/products', icon: '🛍️' },
                                { name: 'Galeria', path: '/admin/galeria', icon: '🖼️' },
                                { name: 'Cupons', path: '/admin/coupons', icon: '🎟️' },
                                { name: 'Eventos', path: '/admin/events', icon: '📅' },
                                // Promoções moved to main menu
                                { name: 'Propagandas', path: '/admin/ads', icon: '📢' },
                                { name: 'Config', path: '/admin/settings', icon: '⚙️' }
                            ].map(link => (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        borderRadius: 'var(--radius)',
                                        background: pathname === link.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        color: 'white',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        marginBottom: '0.25rem',
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title={isCollapsed ? link.name : ''}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
                                    {!isCollapsed && <span style={{ fontWeight: 500 }}>{link.name}</span>}
                                </Link>
                            ))}
                            <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }}></div>
                        </>
                    )}
                </>
            )}

            {/* Admin Quick Actions */}
            {isAdmin && !isClientMode && !isCollapsed && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => router.push('/admin/products/new')}
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.9rem' }}
                    >
                        ➕ Novo Produto
                    </button>
                </div>
            )}

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item, index) => {
                    const isVisibleToClient = settings[item.settingKey];
                    if (!isAdmin && !isVisibleToClient) return null;

                    const isActive = pathname === item.path;
                    const icon = item.name === 'Produtos' ? '🛍️' :
                        item.name === 'Eventos' ? '📅' :
                            item.name === 'Parceiros' ? '🤝' :
                                item.name === 'Patrocinadores' ? '⭐' : '📂';

                    return (
                        <div key={index}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed ? 'center' : 'space-between',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius)',
                                background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                color: 'white',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}>
                                {item.hasSubmenu ? (
                                    <div
                                        onClick={item.toggle}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                                        {!isCollapsed && (
                                            <>
                                                <span style={{ fontWeight: 500, flex: 1 }}>{item.name}</span>
                                                <span style={{ fontSize: '0.8rem' }}>{item.isOpen ? '▼' : '▶'}</span>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.path}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, textDecoration: 'none', color: 'inherit', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                                        {!isCollapsed && <span style={{ fontWeight: 500 }}>{item.name}</span>}
                                    </Link>
                                )}

                                {isAdmin && item.settingKey && !isCollapsed && (
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={settings[item.settingKey] !== false}
                                            onChange={() => toggleSetting(item.settingKey)}
                                            style={{ accentColor: 'var(--accent)' }}
                                        />
                                    </label>
                                )}
                            </div>

                            {item.hasSubmenu && item.isOpen && !isCollapsed && (
                                <div style={{ paddingLeft: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {item.submenu.length > 0 ? item.submenu.map((sub, subIndex) => (
                                        <div key={subIndex} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Link href={`/categories/${sub.slug}`} style={{
                                                textDecoration: 'none',
                                                color: 'var(--muted-foreground)',
                                                fontSize: '0.9rem',
                                                flex: 1,
                                                padding: '0.25rem 0',
                                                paddingLeft: '2rem'
                                            }}>
                                                {sub.name}
                                            </Link>
                                            {isAdmin && (
                                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '0.5rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={sub.visible !== false}
                                                        onChange={() => toggleCategoryVisibility(sub.id, sub.visible)}
                                                        style={{ accentColor: 'var(--accent)', width: '14px', height: '14px' }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    )) : (
                                        <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', paddingLeft: '2rem' }}>Sem categorias</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
