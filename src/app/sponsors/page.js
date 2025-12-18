"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SponsorsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/partners')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter only active sponsors for public view, or show all for admin? 
                    // Usually public page shows active ones. Admin can see all in admin panel.
                    // But here user is admin, so maybe they want to see preview?
                    // Let's show active ones for now, as this is the public page.
                    setSponsors(data.filter(p => p.active));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching sponsors:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Patrocinadores</h1>
                {isAdmin && (
                    <Link href="/admin/partners/new" className="btn btn-primary">
                        ➕ Adicionar Patrocinador
                    </Link>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }}></div>
                </div>
            ) : sponsors.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--foreground)' }}>
                        {isAdmin
                            ? 'Nenhum patrocinador cadastrado. Clique em "Adicionar Patrocinador" para começar.'
                            : 'Nenhum patrocinador disponível no momento.'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {sponsors.map(sponsor => (
                        <div key={sponsor.id} className="card" style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '120px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: 'var(--radius)',
                                padding: '1rem'
                            }}>
                                {sponsor.logo ? (
                                    <img src={sponsor.logo} alt={sponsor.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <span style={{ fontSize: '3rem' }}>🤝</span>
                                )}
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{sponsor.name}</h3>
                            {sponsor.link && (
                                <a
                                    href={sponsor.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline"
                                    style={{ width: '100%', fontSize: '0.9rem' }}
                                >
                                    Visitar Site
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
