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
        // TODO: Fetch sponsors from API when implemented
        setLoading(false);
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Patrocinadores</h1>
                {isAdmin && (
                    <Link href="/sponsors/new" className="btn btn-primary">
                        ➕ Adicionar Patrocinador
                    </Link>
                )}
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : sponsors.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)' }}>
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
                        <div key={sponsor.id} className="card">
                            {/* Sponsor card content will go here */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
