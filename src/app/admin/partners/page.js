"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPartnersPage() {
    const [partners, setPartners] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await fetch('/api/partners');
            if (res.ok) {
                const data = await res.json();
                setPartners(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    const deletePartner = async (id) => {
        if (!confirm('Tem certeza que deseja remover este parceiro?')) return;

        try {
            const res = await fetch(`/api/partners?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchPartners();
            } else {
                alert('Erro ao deletar parceiro');
            }
        } catch (error) {
            console.error('Error deleting partner:', error);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Parceiros & Patrocinadores</h1>
                <Link href="/admin/partners/new" className="btn btn-primary">
                    ➕ Adicionar Novo
                </Link>
            </div>

            {partners.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--card)', borderRadius: 'var(--radius)' }}>
                    <p>Nenhum parceiro cadastrado.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {partners.map(partner => (
                        <div key={partner.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius)' }}>
                                {partner.logo ? (
                                    <img src={partner.logo} alt={partner.name} style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <span style={{ fontSize: '2rem' }}>🤝</span>
                                )}
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>{partner.name}</h3>
                                {partner.link && (
                                    <a href={partner.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                                        {partner.link}
                                    </a>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '10px',
                                    background: partner.active ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                                    color: partner.active ? '#00ff00' : '#ff0000'
                                }}>
                                    {partner.active ? 'Ativo' : 'Inativo'}
                                </span>
                                <button
                                    onClick={() => deletePartner(partner.id)}
                                    className="btn btn-outline"
                                    style={{ color: 'red', borderColor: 'red', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                >
                                    🗑️ Remover
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
