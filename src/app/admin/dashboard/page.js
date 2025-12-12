"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar
} from 'recharts';

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

    if (loading && !stats) return (
        <div className="container" style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <div className="animate-pulse">Carregando dashboard...</div>
        </div>
    );

    if (!stats) return (
        <div className="container" style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Erro ao carregar dados.
        </div>
    );

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // Mock data for charts (since API might not return daily data yet)
    // In a real scenario, this should come from the API
    const chartData = [
        { name: 'Sem 1', vendas: stats.summary.totalRevenue * 0.2 },
        { name: 'Sem 2', vendas: stats.summary.totalRevenue * 0.3 },
        { name: 'Sem 3', vendas: stats.summary.totalRevenue * 0.1 },
        { name: 'Sem 4', vendas: stats.summary.totalRevenue * 0.4 },
    ];

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        Dashboard
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Visão geral da sua loja</p>
                </div>

                <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--foreground)',
                        cursor: 'pointer'
                    }}
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
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: '#fbbf24',
                            borderRadius: 'var(--radius)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            ⚠️ {alert.message}
                        </div>
                    ))}
                </div>
            )}

            {/* Cards de Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <MetricCard
                    title="Receita Total"
                    value={formatCurrency(stats.summary.totalRevenue)}
                    icon="💰"
                    gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                />
                <MetricCard
                    title="Total de Pedidos"
                    value={stats.summary.totalOrders}
                    icon="🛍️"
                    gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                />
                <MetricCard
                    title="Ticket Médio"
                    value={formatCurrency(stats.summary.averageOrderValue)}
                    icon="📊"
                    gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                />
                <MetricCard
                    title="Novos Clientes"
                    value={stats.summary.newCustomers}
                    icon="👥"
                    gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                />
            </div>

            {/* Gráfico de Vendas */}
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--foreground)' }}>
                    Desempenho de Vendas
                </h2>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="var(--muted-foreground)"
                                tick={{ fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                tick={{ fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `R$ ${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="vendas"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorVendas)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Pedidos Recentes */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Pedidos Recentes</h2>
                    {stats.recentOrders.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                                        <th style={{ padding: '0.5rem' }}>ID</th>
                                        <th style={{ padding: '0.5rem' }}>Cliente</th>
                                        <th style={{ padding: '0.5rem' }}>Valor</th>
                                        <th style={{ padding: '0.5rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map(order => (
                                        <tr key={order.id} style={{ background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}>
                                            <td style={{ padding: '1rem', borderRadius: '8px 0 0 8px' }}>#{order.id.slice(-6)}</td>
                                            <td style={{ padding: '1rem' }}>{order.user?.name || 'Anonimo'}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{formatCurrency(order.total)}</td>
                                            <td style={{ padding: '1rem', borderRadius: '0 8px 8px 0' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: order.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    color: order.status === 'COMPLETED' ? '#10b981' : '#ef4444',
                                                    border: `1px solid ${order.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--muted-foreground)' }}>Nenhum pedido recente.</p>
                    )}
                </div>

                {/* Mais Vendidos */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Mais Vendidos</h2>
                    {stats.bestsellers.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {stats.bestsellers.map((product, i) => (
                                <li key={product.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    marginBottom: '0.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{
                                            width: '24px',
                                            height: '24px',
                                            background: i < 3 ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}>
                                            {i + 1}
                                        </span>
                                        <span>{product.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{product.quantity} un.</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--muted-foreground)' }}>Sem dados de vendas.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, gradient }) {
    return (
        <div className="glass" style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease',
            cursor: 'default'
        }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: gradient,
                filter: 'blur(40px)',
                opacity: 0.2,
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{
                    padding: '0.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    fontSize: '1.5rem'
                }}>
                    {icon}
                </div>
                {/* <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>+12%</span> */}
            </div>

            <h3 style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{title}</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--foreground)' }}>{value}</div>
        </div>
    );
}
