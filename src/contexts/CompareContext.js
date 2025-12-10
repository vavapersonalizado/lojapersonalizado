"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export function CompareProvider({ children }) {
    const [compareList, setCompareList] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('compareList');
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading compare list:', e);
            }
        }
    }, []);

    // Save to localStorage whenever list changes
    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product) => {
        if (compareList.length >= 4) {
            alert('Você pode comparar no máximo 4 produtos.');
            return;
        }
        if (compareList.some(item => item.id === product.id)) {
            return; // Already in list
        }
        setCompareList([...compareList, product]);
    };

    const removeFromCompare = (productId) => {
        setCompareList(compareList.filter(item => item.id !== productId));
    };

    const isInCompare = (productId) => {
        return compareList.some(item => item.id === productId);
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    return (
        <CompareContext.Provider value={{
            compareList,
            addToCompare,
            removeFromCompare,
            isInCompare,
            clearCompare
        }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    return useContext(CompareContext);
}
