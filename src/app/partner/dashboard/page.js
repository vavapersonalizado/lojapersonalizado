"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export default function PartnerDashboard() {
    const { data: session, status } = useSession();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated' && session) {
            fetch('/api/partner/stats')
                .then(res => res.json())
                .then(data => {
                    setData(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [session, status]);

    if (status === 'loading' || loading) return <div>Carregando dados...</div>;
    if (status === 'unauthenticated') return <div>Você precisa estar logado como parceiro.</div>;
    if (!data || data.error) return <div>Erro ao carregar dashboard. Você tem certeza que é um parceiro?</div>;

    const { partner, stats } = data;

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                Olá, {partner.name}! 👋
            </h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total de Visualizações</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalViews}</div>
                </div>
                <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Anúncios Ativos</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.activeAds}</div>
                </div>
                <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Promoções Ativas</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.activePromotions}</div>
                </div>
            </div>

            {/* Items List */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Seus Conteúdos</h2>
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: '#6b7280' }}>Título</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: '#6b7280' }}>Tipo</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: '#6b7280' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: '#6b7280' }}>Visualizações</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: '#6b7280' }}>Última Visualização</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '1rem' }}>{item.title}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.8rem',
                                        background: item.type === 'ad' ? '#dbeafe' : '#fce7f3',
                                        color: item.type === 'ad' ? '#1e40af' : '#9d174d'
                                    }}>
                                        {item.type === 'ad' ? 'Anúncio' : 'Promoção'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ color: item.active ? 'green' : 'red' }}>
                                        {item.active ? '● Ativo' : '● Inativo'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.views}</td>
                                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                    {item.lastViewed ? new Date(item.lastViewed).toLocaleString() : '-'}
                                </td>
                            </tr>
                        ))}
                        {stats.items.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    Nenhum conteúdo encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
