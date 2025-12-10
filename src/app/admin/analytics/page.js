"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OnlineCounter from '@/components/OnlineCounter';

export default function AnalyticsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [analytics, setAnalytics] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [sectionOrder, setSectionOrder] = useState([]);
    const [collapsedSections, setCollapsedSections] = useState({});

    // Filtros
    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated' && session?.user?.role === 'admin') {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, session, dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch settings for order
            const settingsRes = await fetch('/api/settings');
            const settingsData = await settingsRes.json();
            if (settingsData.order) {
                setSectionOrder(settingsData.order);
            } else {
                // Default order
                setSectionOrder(['page', 'event', 'product', 'promotion', 'ad', 'partner', 'coupon']);
            }

            // Fetch analytics
            const params = new URLSearchParams();
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
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setEditValue(item.editedViews !== null ? item.editedViews.toString() : item.views.toString());
    };

    const handleSave = async (id) => {
        try {
            if (editValue === '' || editValue === null) {
                alert('Por favor, insira um valor válido.');
                return;
            }

            const newValue = parseInt(editValue);
            if (isNaN(newValue)) {
                alert('O valor deve ser um número.');
                return;
            }

            const res = await fetch(`/api/analytics/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ editedViews: newValue })
            });

            if (res.ok) {
                setEditingId(null);
                fetchData(); // Refresh data
            } else {
                const data = await res.json();
                console.error('Save error data:', data);
                alert(`Erro ao salvar: ${data.error || 'Erro desconhecido'}\nDetalhes: ${data.details || 'Sem detalhes técnicos'}`);
            }
        } catch (error) {
            console.error('Error updating analytics:', error);
            alert('Erro ao conectar com o servidor. Verifique o console para mais detalhes.');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleDebug = async () => {
        try {
            const res = await fetch('/api/debug-db');
            const data = await res.json();
            alert(`Status do DB:\nAnalytics: ${data.analyticsCount}\nEvents: ${data.eventsCount}\nEnv: ${data.env}`);
        } catch (error) {
            alert('Erro ao testar DB: ' + error.message);
        }
    };

    const toggleSection = (type) => {
        setCollapsedSections(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const moveSection = async (index, direction) => {
        const newOrder = [...sectionOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        } else {
            return;
        }

        setSectionOrder(newOrder);

        // Save new order
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: newOrder })
            });
        } catch (error) {
            console.error('Failed to save order:', error);
        }
    };

    const exportCSV = () => {
        const headers = ['Nome', 'Código', 'Tipo', 'Visualizações Originais', 'Views (7 dias)', 'Views (30 dias)', 'Visualizações Editadas', 'Usos', 'Criado Em', 'Última Visualização'];
        const rows = analytics.map(item => [
            item.itemName,
            item.itemCode || '-',
            item.type,
            item.views,
            item.weeklyViews || 0,
            item.monthlyViews || 0,
            item.editedViews || item.views,
            item.uses,
            new Date(item.createdAt).toLocaleDateString(),
            new Date(item.lastViewedAt).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Group analytics by type
    const groupedAnalytics = analytics.reduce((acc, item) => {
        const type = item.type || 'other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
    }, {});

    const typeLabels = {
        product: 'Produtos',
        event: 'Eventos',
        promotion: 'Promoções',
        ad: 'Propagandas',
        coupon: 'Cupons',
        page: 'Páginas',
        partner: 'Parceiros',
        other: 'Outros'
    };

    if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>Analytics</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleDebug}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        🛠️ Debug DB
                    </button>
                    <button onClick={exportCSV} className="btn btn-primary">Exportar CSV</button>
                </div>
            </div>

            {/* Resumo Cards */}
            {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3>Total Visualizações</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary.totalViews}</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3>Total Usos (Cupons)</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary.totalUses}</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Usuários Online</h3>
                        <OnlineCounter />
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
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
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {sectionOrder.map((type, index) => {
                    const items = groupedAnalytics[type] || [];
                    // Show section if it has items OR if it's in the order list (so user can reorder empty sections too, or maybe not?)
                    // Let's show only if items exist to avoid clutter, but then user can't reorder empty sections.
                    // User asked to "choose order of lists".
                    // Let's show all sections defined in order, even if empty, so they can be reordered?
                    // Or maybe just show if items exist.
                    if (items.length === 0) return null;

                    const isCollapsed = collapsedSections[type];

                    return (
                        <div key={type} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#f5f5f5',
                                    borderBottom: isCollapsed ? 'none' : '1px solid var(--border)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => toggleSection(type)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                        display: 'inline-block',
                                        width: '20px',
                                        textAlign: 'center'
                                    }}>▼</span>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>{typeLabels[type] || type} ({items.length})</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => moveSection(index, 'up')}
                                        disabled={index === 0}
                                        className="btn btn-outline"
                                        style={{ padding: '0.25rem 0.5rem', opacity: index === 0 ? 0.3 : 1 }}
                                        title="Mover para cima"
                                    >
                                        ⬆️
                                    </button>
                                    <button
                                        onClick={() => moveSection(index, 'down')}
                                        disabled={index === sectionOrder.length - 1}
                                        className="btn btn-outline"
                                        style={{ padding: '0.25rem 0.5rem', opacity: index === sectionOrder.length - 1 ? 0.3 : 1 }}
                                        title="Mover para baixo"
                                    >
                                        ⬇️
                                    </button>
                                </div>
                            </div>

                            {!isCollapsed && (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)', background: '#fff' }}>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Nome</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Views Originais</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>7 Dias</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>30 Dias</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Views Editadas</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: '500', color: '#000' }}>{item.itemName}</div>
                                                        {item.itemCode && <div style={{ fontSize: '0.875rem', color: '#000000' }}>Ref: {item.itemCode}</div>}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                                                        {item.views}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                                                        {item.weeklyViews || 0}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                                                        {item.monthlyViews || 0}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        {editingId === item.id ? (
                                                            <input
                                                                type="number"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                style={{ width: '80px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                                                            />
                                                        ) : (
                                                            <span style={{ fontWeight: '600', color: '#000' }}>
                                                                {item.editedViews !== null ? item.editedViews : item.views}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        {editingId === item.id ? (
                                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                                <button onClick={() => handleSave(item.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Salvar</button>
                                                                <button onClick={handleCancel} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Cancelar</button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => handleEdit(item)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Editar</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
