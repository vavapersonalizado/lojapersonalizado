"use client";

import { useCompare } from '@/contexts/CompareContext';

export default function CompareButton({ product }) {
    const { isInCompare, addToCompare, removeFromCompare, compareList } = useCompare();
    const isAdded = isInCompare(product.id);

    const handleClick = (e) => {
        e.preventDefault(); // Prevent navigation if inside a link
        e.stopPropagation();

        if (isAdded) {
            removeFromCompare(product.id);
        } else {
            addToCompare(product);
        }
    };

    return (
        <button
            onClick={handleClick}
            title={isAdded ? "Remover da comparação" : "Adicionar à comparação"}
            style={{
                background: isAdded ? 'var(--secondary)' : 'transparent',
                color: isAdded ? 'white' : 'var(--secondary)',
                border: '1px solid var(--secondary)',
                borderRadius: '4px',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                fontSize: '0.9rem'
            }}
        >
            {isAdded ? '⚖️ Comparando' : '⚖️ Comparar'}
        </button>
    );
}
