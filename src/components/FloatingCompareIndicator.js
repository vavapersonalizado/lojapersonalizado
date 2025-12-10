"use client";

import { useCompare } from '@/contexts/CompareContext';
import Link from 'next/link';

export default function FloatingCompareIndicator() {
    const { compareList } = useCompare();

    if (compareList.length === 0) return null;

    return (
        <Link
            href="/compare"
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'var(--secondary)',
                color: 'white',
                padding: '1rem',
                borderRadius: '50px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                zIndex: 1000,
                fontWeight: 'bold'
            }}
        >
            <span>⚖️</span>
            <span>Comparar ({compareList.length})</span>
        </Link>
    );
}
