"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const [settings, setSettings] = useState({
        showProducts: true,
        showCategories: true,
        showEvents: true,
        showPartners: true,
        showSponsors: true
    });
    const [categories, setCategories] = useState([]);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

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

    const menuItems = [
        { name: 'Produtos', path: '/products', settingKey: 'showProducts' },
        {
            name: 'Categorias',
            path: '#',
            settingKey: 'showCategories',
            hasSubmenu: true,
            isOpen: isCategoriesOpen,
            toggle: () => setIsCategoriesOpen(!isCategoriesOpen),
            submenu: categories.map(cat => ({ name: cat.name, path: `/products?category=${cat.id}` }))
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
            <div style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Menu
            </div>

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
                                    <input
                                        type="checkbox"
                                        checked={settings[item.settingKey] || false}
                                        onChange={() => toggleSetting(item.settingKey)}
                                        title={`Visível para clientes: ${settings[item.settingKey] ? 'Sim' : 'Não'}`}
                                        style={{ cursor: 'pointer' }}
                                    />
                                )}
                            </div>

                            {item.hasSubmenu && item.isOpen && (
                                <div style={{ paddingLeft: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {item.submenu.length > 0 ? item.submenu.map((sub, subIndex) => (
                                        <Link key={subIndex} href={sub.path} style={{
                                            textDecoration: 'none',
                                            color: 'var(--muted-foreground)',
                                            fontSize: '0.9rem'
                                        }}>
                                            {sub.name}
                                        </Link>
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
