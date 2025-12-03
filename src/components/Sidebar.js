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
            .then(data => setCategories(data))
            .catch(err => console.error(err));
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
        { name: 'Parceiros', path: '/partners', settingKey: 'showPartners' },
        { name: 'Patrocinadores', path: '/sponsors', settingKey: 'showSponsors' },
    ];

    return (
        <aside style={{
            width: '250px',
            background: 'var(--card)',
            borderRight: '1px solid var(--border)',
            padding: '1rem',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Menu
                </div>
                {isAdmin && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--primary)',
                            background: 'var(--secondary)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius)',
                            display: 'inline-block',
                            alignSelf: 'flex-start'
                        }}>
                            ⚡ Modo Admin
                        </div>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            background: 'var(--muted)'
                        }}>
                            <input
                                type="checkbox"
                                checked={isClientMode}
                                onChange={(e) => setIsClientMode(e.target.checked)}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            👁️ Ver como Cliente
                        </label>
                    </div>
                )}
            </div>

            {/* Admin Quick Actions */}
            {isAdmin && !isClientMode && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => router.push('/admin/products/new')}
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    >
                        ➕ Adicionar Produto
                    </button>
                </div>
            )}

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item, index) => {
                    // Admin vê tudo sempre, cliente só vê se estiver habilitado
                    const isVisibleToClient = settings[item.settingKey];
                    if (!isAdmin && !isVisibleToClient) return null;

                    return (
                        <div key={index}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius)',
                                background: pathname === item.path ? 'var(--primary)' : 'transparent',
                                color: pathname === item.path ? 'var(--primary-foreground)' : 'inherit',
                            }}>
                                {item.hasSubmenu ? (
                                    <button
                                        onClick={item.toggle}
                                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', flex: 1, textAlign: 'left', fontWeight: 'bold' }}
                                    >
                                        {item.name} {item.isOpen ? '▼' : '▶'}
                                    </button>
                                ) : (
                                    <Link href={item.path} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
                                        {item.name}
                                    </Link>
                                )}

                                {isAdmin && item.settingKey && (
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={settings[item.settingKey] !== false}
                                            onChange={() => toggleSetting(item.settingKey)}
                                            title={`Visível para clientes: ${settings[item.settingKey] ? 'Sim' : 'Não'}`}
                                            style={{
                                                cursor: 'pointer',
                                                width: '16px',
                                                height: '16px',
                                                accentColor: 'var(--primary)'
                                            }}
                                        />
                                    </label>
                                )}
                            </div>

                            {item.hasSubmenu && item.isOpen && (
                                <div style={{ paddingLeft: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {item.submenu.length > 0 ? item.submenu.map((sub, subIndex) => (
                                        <div key={subIndex} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Link href={`/categories/${sub.slug}`} style={{
                                                textDecoration: 'none',
                                                color: 'var(--muted-foreground)',
                                                fontSize: '0.9rem',
                                                flex: 1
                                            }}>
                                                {sub.name}
                                            </Link>
                                            {isAdmin && (
                                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '0.5rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={sub.visible !== false}
                                                        onChange={() => toggleCategoryVisibility(sub.id, sub.visible)}
                                                        title={`Visível para clientes: ${sub.visible !== false ? 'Sim' : 'Não'}`}
                                                        style={{
                                                            cursor: 'pointer',
                                                            width: '14px',
                                                            height: '14px',
                                                            accentColor: 'var(--primary)'
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    )) : (
                                        <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>Sem categorias</span>
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
