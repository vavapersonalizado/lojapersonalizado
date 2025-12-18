"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const pathname = usePathname();

    // Default structure now separates Global from Pages
    const defaultTheme = {
        global: {
            primary: '#7C3AED',
            secondary: '#F472B6',
            accent: '#D4AF37',
            background: '#0a0e27',
            card: 'rgba(255, 255, 255, 0.05)',
            foreground: '#ffffff',
            radius: '0.75rem',
            profilePopupBackground: '#ffffff',
            profilePopupText: '#000000',
        },
        pages: {
            home: {},
            product: {},
            cart: {},
            checkout: {},
            admin: {}
        },
        texts: {
            homeTitle: 'Vanessa Yachiro',
            checkoutTitle: 'Finalizar Solicitação',
            blogTitle: 'Mural Social',
            footerText: '© 2025 Vanessa Yachiro Personalizados',
            addToCart: 'Adicionar ao Carrinho',
            buyNow: 'Comprar Agora',
            contact: 'Fale Conosco',
            searchPlaceholder: 'Buscar produtos...'
        },
        icons: {
            cart: [
                { value: '🛒', visible: true },
                { value: '🛍️', visible: true },
                { value: '🎁', visible: true }
            ],
            bell: [
                { value: '🔔', visible: true },
                { value: '🔕', visible: true }
            ],
            mobile: [
                { value: '📱', visible: true },
                { value: '📲', visible: true }
            ],
            desktop: [
                { value: '💻', visible: true },
                { value: '🖥️', visible: true }
            ]
        }
    };

    const [theme, setTheme] = useState(defaultTheme);

    // Load theme from API/Local Storage
    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data && data.theme) {
                    // Migration logic: If old structure, move to global
                    let loadedTheme = data.theme;
                    if (!loadedTheme.global) {
                        loadedTheme = {
                            ...defaultTheme,
                            global: { ...defaultTheme.global, ...data.theme }, // Attempt to map old keys
                            texts: { ...defaultTheme.texts, ...data.theme.texts },
                            icons: defaultTheme.icons // Reset icons to new structure to avoid breakage
                        };
                    }
                    setTheme(prev => ({ ...prev, ...loadedTheme }));
                    localStorage.setItem('site-theme', JSON.stringify(loadedTheme));
                }
            } catch (error) {
                console.error('Error fetching theme:', error);
                const savedTheme = localStorage.getItem('site-theme');
                if (savedTheme) {
                    setTheme(JSON.parse(savedTheme));
                }
            }
        };

        fetchTheme();
    }, []);

    // Apply styles based on current route
    useEffect(() => {
        if (!theme) return;

        const root = document.documentElement;

        // 1. Apply Global Styles first
        Object.entries(theme.global || {}).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        // 2. Determine current page scope
        let pageScope = null;
        if (pathname === '/') pageScope = 'home';
        else if (pathname.startsWith('/product')) pageScope = 'product';
        else if (pathname.startsWith('/cart')) pageScope = 'cart';
        else if (pathname.startsWith('/checkout')) pageScope = 'checkout';
        else if (pathname.startsWith('/admin')) pageScope = 'admin';

        // 3. Apply Page Overrides
        if (pageScope && theme.pages?.[pageScope]) {
            Object.entries(theme.pages[pageScope]).forEach(([key, value]) => {
                if (value) { // Only apply if value exists
                    root.style.setProperty(`--${key}`, value);
                }
            });
        }

        // 4. Apply Effects
        const effects = theme.global?.effects || {};
        let effectsCss = '';

        // Helper to adjust brightness
        const adjustBrightness = (col, amt) => {
            col = col.replace(/^#/, '');
            if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
            let num = parseInt(col, 16);
            let r = (num >> 16) + amt;
            let b = ((num >> 8) & 0x00FF) + amt;
            let g = (num & 0x0000FF) + amt;
            if (r > 255) r = 255; else if (r < 0) r = 0;
            if (b > 255) b = 255; else if (b < 0) b = 0;
            if (g > 255) g = 255; else if (g < 0) g = 0;
            return "#" + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
        };

        if (effects.button === 'chrome') {
            const baseColor = effects.chromeColor || '#e0e0e0';
            const highlight = adjustBrightness(baseColor, 50);
            const shadow = adjustBrightness(baseColor, -50);

            effectsCss += `
                .btn {
                    background: linear-gradient(135deg, ${highlight} 0%, ${baseColor} 50%, ${shadow} 51%, ${highlight} 100%) !important;
                    color: ${adjustBrightness(baseColor, -100)} !important;
                    border: 1px solid ${shadow} !important;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4) !important;
                    text-shadow: 0 1px 0 rgba(255,255,255,0.4);
                    font-weight: bold;
                }
                .btn:hover {
                    background: linear-gradient(135deg, ${baseColor} 0%, ${highlight} 50%, ${baseColor} 51%, ${highlight} 100%) !important;
                }
            `;
        } else if (effects.button === 'glass') {
            effectsCss += `
                .btn {
                    background: rgba(255, 255, 255, 0.1) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                    color: var(--foreground) !important;
                }
                .btn:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                }
            `;
        } else if (effects.button === 'neon') {
            effectsCss += `
                .btn {
                    background: transparent !important;
                    border: 2px solid var(--primary) !important;
                    color: var(--primary) !important;
                    box-shadow: 0 0 10px var(--primary), inset 0 0 5px var(--primary) !important;
                    text-shadow: 0 0 5px var(--primary);
                }
                .btn:hover {
                    background: var(--primary) !important;
                    color: #fff !important;
                    box-shadow: 0 0 20px var(--primary), inset 0 0 10px var(--primary) !important;
                }
            `;
        }

        if (effects.animation === 'pulse') {
            effectsCss += `
                @keyframes pulse-soft {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
                .btn, .card {
                    animation: pulse-soft 3s infinite ease-in-out;
                }
            `;
        } else if (effects.animation === 'shimmer') {
            effectsCss += `
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .btn-primary {
                    background: linear-gradient(90deg, var(--primary) 25%, var(--accent) 50%, var(--primary) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite linear;
                }
            `;
        } else if (effects.animation === 'float') {
            effectsCss += `
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                    100% { transform: translateY(0px); }
                }
                .card {
                    animation: float 6s infinite ease-in-out;
                }
            `;
        }

        // Inject style tag
        let styleTag = document.getElementById('theme-effects');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'theme-effects';
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = effectsCss;

    }, [theme, pathname]);

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('site-theme', JSON.stringify(newTheme));
    };

    const updateText = async (key, value) => {
        const newTheme = {
            ...theme,
            texts: {
                ...theme.texts,
                [key]: value
            }
        };
        setTheme(newTheme);
        localStorage.setItem('site-theme', JSON.stringify(newTheme));

        // Persist to API
        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme })
            });
        } catch (error) {
            console.error('Failed to save text update:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, updateText }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
