"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState({
        primary: '#7C3AED',
        secondary: '#F472B6',
        accent: '#D4AF37',
        background: '#0a0e27',
        card: 'rgba(255, 255, 255, 0.05)',
        text: '#ffffff',
        radius: '0.75rem',
        profilePopupBackground: '#ffffff',
        // Page specific backgrounds (default to null/undefined to use CSS fallbacks)
        headerBg: '',
        checkoutBg: '',
        blogBg: '',
        productCardBg: '',
        texts: {
            homeTitle: 'Vanessa Yachiro',
            checkoutTitle: 'Finalizar Solicitação',
            blogTitle: 'Mural Social',
            footerText: '© 2025 Vanessa Yachiro Personalizados'
        }
    });

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data && data.theme) {
                    // Merge with defaults to ensure new keys exist
                    setTheme(prev => ({ ...prev, ...data.theme, texts: { ...prev.texts, ...data.theme.texts } }));
                    localStorage.setItem('site-theme', JSON.stringify(data.theme));
                } else {
                    const savedTheme = localStorage.getItem('site-theme');
                    if (savedTheme) {
                        setTheme(JSON.parse(savedTheme));
                    }
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

    const updateTheme = (newTheme) => {
        const updated = { ...theme, ...newTheme };
        setTheme(updated);
        localStorage.setItem('site-theme', JSON.stringify(updated));

        // Apply to CSS variables (skip objects like 'texts')
        const root = document.documentElement;
        Object.entries(updated).forEach(([key, value]) => {
            if (typeof value !== 'object') {
                root.style.setProperty(`--${key}`, value);
            }
        });
    };

    // Initial application of theme
    useEffect(() => {
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
            if (typeof value !== 'object') {
                root.style.setProperty(`--${key}`, value);
            }
        });
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
