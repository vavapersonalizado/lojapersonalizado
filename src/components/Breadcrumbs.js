"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Breadcrumbs({ items }) {
    const { t } = useLanguage();

    return (
        <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
            <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                <li>
                    <Link href="/" style={{ color: 'var(--muted-foreground)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--muted-foreground)'}>
                        Home
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ margin: '0 0.5rem', color: 'var(--border)' }}>/</span>
                        {item.href ? (
                            <Link href={item.href} style={{ color: 'var(--muted-foreground)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--muted-foreground)'}>
                                {item.label}
                            </Link>
                        ) : (
                            <span style={{ color: 'var(--foreground)', fontWeight: '500' }}>
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
