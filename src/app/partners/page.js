"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function PartnersPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const { trackView } = useAnalytics();
    const tracked = useRef(false);

    useEffect(() => {
        if (!tracked.current) {
            trackView('page', 'partners', 'Parceiros');
            tracked.current = true;
        }
        fetchPartners();
    }, [trackView]);

    const fetchPartners = async () => {
        try {
            const res = await fetch('/api/partners');
            const data = await res.json();
            setPartners(data);
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePartnerClick = (partner) => {
        trackView('partner', partner.id, partner.name);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Parceiros</h1>
                {isAdmin && (
                    <Link href="/admin/partners/new" className="btn btn-primary">
                        ➕ Adicionar Parceiro
                    </Link>
                )}
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : partners.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <p style={{ fontSize: '1.2rem', color: '#000000' }}>
                        {isAdmin
                            ? 'Nenhum parceiro cadastrado. Clique em "Adicionar Parceiro" para começar.'
                            : 'Nenhum parceiro disponível no momento.'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {partners.map(partner => (
                        <a
                            key={partner.id}
                            href={partner.link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card"
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                            onClick={() => handlePartnerClick(partner)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {partner.logo ? (
                                <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', background: '#f5f5f5', borderRadius: 'var(--radius)' }}>
                                    <img src={partner.logo} alt={partner.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                            ) : (
                                <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', background: '#f5f5f5', borderRadius: 'var(--radius)', fontSize: '3rem' }}>
                                    🤝
                                </div>
                            )}
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{partner.name}</h3>
                            {partner.link && <p style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>Visitar site ↗</p>}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
