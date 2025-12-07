"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ViewContext = createContext();

export function ViewProvider({ children }) {
    const [viewMode, setViewMode] = useState('desktop'); // 'mobile' or 'desktop'
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Detect device on mount
        const isMobileDevice = () => {
            // Check screen width
            if (typeof window !== 'undefined') {
                const width = window.innerWidth;
                const isMobileWidth = width <= 768;

                // Check user agent as secondary check
                const userAgent = navigator.userAgent.toLowerCase();
                const isMobileUA = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

                return isMobileWidth || isMobileUA;
            }
            return false;
        };

        // Check localStorage for saved preference
        const savedViewMode = localStorage.getItem('viewMode');

        if (savedViewMode) {
            setViewMode(savedViewMode);
        } else {
            // Auto-detect on first visit
            setViewMode(isMobileDevice() ? 'mobile' : 'desktop');
        }

        setIsInitialized(true);
    }, []);

    const toggleViewMode = () => {
        const newMode = viewMode === 'mobile' ? 'desktop' : 'mobile';
        setViewMode(newMode);
        localStorage.setItem('viewMode', newMode);
    };

    const setMobileView = () => {
        setViewMode('mobile');
        localStorage.setItem('viewMode', 'mobile');
    };

    const setDesktopView = () => {
        setViewMode('desktop');
        localStorage.setItem('viewMode', 'desktop');
    };

    return (
        <ViewContext.Provider value={{
            viewMode,
            toggleViewMode,
            setMobileView,
            setDesktopView,
            isMobile: viewMode === 'mobile',
            isInitialized
        }}>
            {children}
        </ViewContext.Provider>
    );
}

export function useView() {
    const context = useContext(ViewContext);
    if (!context) {
        throw new Error('useView must be used within ViewProvider');
    }
    return context;
}
