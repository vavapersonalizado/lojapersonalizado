"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState({
        primary: '#7C3AED',
        secondary: '#F472B6',
        accent: '#D4AF37',
        background: '#0a0e27', // Dark by default for futuristic look
        card: 'rgba(255, 255, 255, 0.05)',
        text: '#ffffff',
        radius: '0.75rem'
    });

    useEffect(() => {
        // Load theme from API and fallback to localStorage
        const fetchTheme = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data && data.theme) {
                    setTheme(data.theme);
                    // Update localStorage to keep in sync
                    localStorage.setItem('site-theme', JSON.stringify(data.theme));
                } else {
                    // Fallback to localStorage if API has no theme yet
                    const savedTheme = localStorage.getItem('site-theme');
                    if (savedTheme) {
                        setTheme(JSON.parse(savedTheme));
                    }
                }
            } catch (error) {
                console.error('Error fetching theme:', error);
                // Fallback to localStorage on error
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

        // Apply to CSS variables
        const root = document.documentElement;
        Object.entries(updated).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    };

    // Initial application of theme
    useEffect(() => {
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
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
