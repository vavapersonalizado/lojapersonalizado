"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [analytics, setAnalytics] = useState([]);
    const [summary, setSummary] = useState(null);
    const [top10, setTop10] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState('views');
    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated' && session?.user?.role === 'admin') {
            fetchAnalytics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, session, typeFilter, sortBy, dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter) params.append('type', typeFilter);
            params.append('sortBy', sortBy);

            // Calcular datas baseado no range
            if (dateRange !== 'all') {
                const endDate = new Date();
                const startDate = new Date();

                if (dateRange === 'week') startDate.setDate(startDate.getDate() - 7);
                else if (dateRange === 'month') startDate.setMonth(startDate.getMonth() - 1);
                else if (dateRange === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

                params.append('startDate', startDate.toISOString());
                params.append('endDate', endDate.toISOString());
            }

            const res = await fetch(`/api/analytics/stats?${params}`);
            const data = await res.json();

            setAnalytics(data.analytics || []);
            setSummary(data.summary || {});
            setTop10(data.top10 || []);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        const headers = ['Nome', 'Código', 'Tipo', 'Visualizações', 'Usos', 'Criado Em', 'Última Visualização'];
        const rows = analytics.map(item => [
            item.itemName,
            item.itemCode || '-',
            item.type,
            item.views,
            item.uses,
            new Date(item.createdAt).toLocaleDateString('pt-BR'),
            new Date(item.lastViewedAt).toLocaleDateString('pt-BR')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (status === 'loading' || loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;
    }

    if (!session || session.user.role !== 'admin') {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Acesso negado</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>📊 Painel de Analytics</h1>
                <button onClick={exportCSV} className="btn btn-primary">
                    📥 Exportar CSV
                </button>
            </div>

            {/* Resumo */}
            {summary && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total de Visualizações</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>{summary.totalViews?.toLocaleString()}</div>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total de Usos</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>{summary.totalUses?.toLocaleString()}</div>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total de Itens</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>{summary.totalItems?.toLocaleString()}</div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                background: 'white',
                padding: '1rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#000' }}>
                        Tipo
                    </label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    >
                        <option value="">Todos</option>
                        <option value="product">Produtos</option>
                        <option value="event">Eventos</option>
                        <option value="promotion">Promoções</option>
                        <option value="ad">Propagandas</option>
                        <option value="coupon">Cupons</option>
                        <option value="page">Páginas</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#000' }}>
                        Período
                    </label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    >
                        <option value="all">Todos</option>
                        <option value="week">Última Semana</option>
                        <option value="month">Último Mês</option>
                        <option value="year">Último Ano</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#000' }}>
                        Ordenar por
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    >
                        <option value="views">Visualizações</option>
                        <option value="uses">Usos</option>
                        <option value="createdAt">Data de Criação</option>
                        <option value="lastViewedAt">Última Visualização</option>
                    </select>
                </div>
            </div>

            {/* Top 10 */}
            {top10.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#000' }}>🏆 Top 10 Mais Visualizados</h2>
                    <div style={{
                        background: 'white',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        overflow: 'hidden'
                    }}>
                        {top10.map((item, index) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    borderBottom: index < top10.length - 1 ? '1px solid var(--border)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#666' }}>#{index + 1}</span>
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#000' }}>{item.itemName}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                            {item.type === 'product' && '🛍️ Produto'}
                                            {item.type === 'event' && '📅 Evento'}
                                            {item.type === 'promotion' && '🎁 Promoção'}
                                            {item.type === 'ad' && '📢 Propaganda'}
                                            {item.type === 'coupon' && '🎟️ Cupom'}
                                            {item.itemCode && ` • ${item.itemCode}`}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000' }}>{item.views}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#666' }}>visualizações</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabela de Dados */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                overflow: 'auto'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#000' }}>Nome</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#000' }}>Código</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#000' }}>Tipo</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#000' }}>Visualizações</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#000' }}>Usos</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#000' }}>Criado Em</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#000' }}>Última Visualização</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analytics.map((item, index) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', color: '#000' }}>{item.itemName}</td>
                                <td style={{ padding: '1rem', color: '#666' }}>{item.itemCode || '-'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.875rem',
                                        background: 'var(--muted)',
                                        color: '#000'
                                    }}>
                                        {item.type === 'product' && '🛍️ Produto'}
                                        {item.type === 'event' && '📅 Evento'}
                                        {item.type === 'promotion' && '🎁 Promoção'}
                                        {item.type === 'ad' && '📢 Propaganda'}
                                        {item.type === 'coupon' && '🎟️ Cupom'}
                                        {item.type === 'page' && '📄 Página'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#000' }}>{item.views}</td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#000' }}>{item.uses}</td>
                                <td style={{ padding: '1rem', color: '#666' }}>
                                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td style={{ padding: '1rem', color: '#666' }}>
                                    {new Date(item.lastViewedAt).toLocaleDateString('pt-BR')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {analytics.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        Nenhum dado de analytics encontrado
                    </div>
                )}
            </div>
        </div>
    );
}
