"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
            return;
        }
        if (status === 'authenticated') {
            fetchStats();
        }
    }, [status, period]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/stats?period=${period}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) return <div className="p-8 text-center">Carregando dashboard...</div>;
    if (!stats) return <div className="p-8 text-center">Erro ao carregar dados.</div>;

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Dashboard Administrativo</h1>
                <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    <option value={7}>Últimos 7 dias</option>
                    <option value={30}>Últimos 30 dias</option>
                    <option value={90}>Últimos 90 dias</option>
                </select>
            </div>

            {/* Alertas */}
            {stats.alerts && stats.alerts.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    {stats.alerts.map((alert, i) => (
                        <div key={i} style={{
                            padding: '1rem',
                            marginBottom: '0.5rem',
                            background: '#fff3cd',
                            color: '#856404',
                            borderRadius: '4px',
                            border: '1px solid #ffeeba'
                        }}>
                            ⚠️ {alert.message}
                        </div>
                    ))}
                </div>
            )}

            {/* Cards de Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <MetricCard title="Receita Total" value={formatCurrency(stats.summary.totalRevenue)} color="#10b981" />
                <MetricCard title="Total de Pedidos" value={stats.summary.totalOrders} color="#3b82f6" />
                <MetricCard title="Ticket Médio" value={formatCurrency(stats.summary.averageOrderValue)} color="#8b5cf6" />
                <MetricCard title="Novos Clientes" value={stats.summary.newCustomers} color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Pedidos Recentes */}
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>Pedidos Recentes</h2>
                    {stats.recentOrders.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                    <th style={{ padding: '0.5rem' }}>ID</th>
                                    <th style={{ padding: '0.5rem' }}>Cliente</th>
                                    <th style={{ padding: '0.5rem' }}>Valor</th>
                                    <th style={{ padding: '0.5rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '0.5rem' }}>#{order.id.slice(-6)}</td>
                                        <td style={{ padding: '0.5rem' }}>{order.user?.name || 'Anonimo'}</td>
                                        <td style={{ padding: '0.5rem' }}>{formatCurrency(order.total)}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '99px',
                                                fontSize: '0.8rem',
                                                background: order.status === 'COMPLETED' ? '#d1fae5' : '#fee2e2',
                                                color: order.status === 'COMPLETED' ? '#065f46' : '#991b1b'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: '#666' }}>Nenhum pedido recente.</p>
                    )}
                </div>

                {/* Mais Vendidos */}
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>Produtos Mais Vendidos</h2>
                    {stats.bestsellers.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {stats.bestsellers.map((product, i) => (
                                <li key={product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f9f9f9' }}>
                                    <span>{i + 1}. {product.name}</span>
                                    <span style={{ fontWeight: 'bold' }}>{product.quantity} un.</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#666' }}>Sem dados de vendas.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, color }) {
    return (
        <div style={{
            padding: '1.5rem',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${color}`
        }}>
            <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{title}</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
        </div>
    );
}
