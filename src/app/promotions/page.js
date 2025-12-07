"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PromotionsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/promotions')
            .then(res => res.json())
            .then(data => {
                setPromotions(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setPromotions([]);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Promoções</h1>
                {isAdmin && (
                    <Link href="/admin/promotions" className="btn btn-primary">
                        ⚙️ Gerenciar Promoções
                    </Link>
                )}
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : promotions.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)' }}>
                        Nenhuma promoção ativa no momento.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {promotions.map(promo => (
                        <div key={promo.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {promo.imageUrl && (
                                <div style={{ height: '200px', overflow: 'hidden' }}>
                                    <img
                                        src={promo.imageUrl}
                                        alt={promo.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{promo.title}</h3>
                                    {promo.discount > 0 && (
                                        <span style={{
                                            background: 'var(--primary)',
                                            color: 'white',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: 'var(--radius)',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {promo.discount}% OFF
                                        </span>
                                    )}
                                </div>
                                <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', flex: 1 }}>
                                    {promo.description}
                                </p>
                                {promo.htmlContent && (
                                    <div
                                        style={{ marginBottom: '1rem', overflow: 'hidden' }}
                                        dangerouslySetInnerHTML={{ __html: promo.htmlContent }}
                                    />
                                )}
                                <Link href="/products" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
                                    Aproveitar Oferta
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
