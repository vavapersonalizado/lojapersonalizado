"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PartnersPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch partners from API when implemented
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Parceiros</h1>
                {isAdmin && (
                    <Link href="/partners/new" className="btn btn-primary">
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
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)' }}>
                        {isAdmin
                            ? 'Nenhum parceiro cadastrado. Clique em "Adicionar Parceiro" para começar.'
                            : 'Nenhum parceiro disponível no momento.'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {partners.map(partner => (
                        <div key={partner.id} className="card">
                            {/* Partner card content will go here */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
