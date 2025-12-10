"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Breadcrumbs({ items }) {
    const { t } = useLanguage();

    return (
        <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#000000' }}>
            <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                <li>
                    <Link href="/" style={{ color: '#000000', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#000000'}>
                        Home
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ margin: '0 0.5rem', color: 'var(--border)' }}>/</span>
                        {item.href ? (
                            <Link href={item.href} style={{ color: '#000000', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#000000'}>
                                {item.label}
                            </Link>
                        ) : (
                            <span style={{ color: '#000000', fontWeight: '500' }}>
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
