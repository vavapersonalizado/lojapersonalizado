"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, session]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const toggleContacted = async (orderId, currentContactedAt) => {
        const newContactedAt = currentContactedAt ? null : new Date().toISOString();
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactedAt: newContactedAt })
            });

            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Error updating contact status:', error);
        }
    };

    const toggleItemReady = async (itemId, currentReady) => {
        try {
            const res = await fetch(`/api/orders/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ready: !currentReady })
            });

            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Error updating item ready status:', error);
        }
    };

    const toggleExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'active') {
            return ['pending', 'processing'].includes(order.status);
        } else {
            return ['completed', 'cancelled'].includes(order.status);
        }
    });

    if (loading) return <p style={{ padding: '2rem', textAlign: 'center' }}>Carregando pedidos...</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', color: 'black' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                📦 Gerenciar Pedidos
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('active')}
                    style={{
                        padding: '1rem',
                        borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : 'none',
                        fontWeight: activeTab === 'active' ? 'bold' : 'normal',
                        color: activeTab === 'active' ? 'var(--primary)' : 'var(--muted-foreground)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Pedidos Ativos ({orders.filter(o => ['pending', 'processing'].includes(o.status)).length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '1rem',
                        borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : 'none',
                        fontWeight: activeTab === 'history' ? 'bold' : 'normal',
                        color: activeTab === 'history' ? 'var(--primary)' : 'var(--muted-foreground)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Histórico ({orders.filter(o => ['completed', 'cancelled'].includes(o.status)).length})
                </button>
            </div>

            {filteredOrders.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)' }}>
                        Nenhum pedido nesta aba.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {filteredOrders.map((order) => {
                        const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
                        const readyItems = order.items.filter(i => i.ready).reduce((acc, item) => acc + item.quantity, 0);
                        const pendingItems = totalItems - readyItems;
                        const isExpanded = expandedOrderId === order.id;

                        return (
                            <div
                                key={order.id}
                                className="card"
                                style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Order Summary Row */}
                                <div
                                    style={{
                                        padding: '1.5rem',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                        gap: '1rem',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        background: isExpanded ? '#f9f9f9' : 'transparent'
                                    }}
                                    onClick={() => toggleExpand(order.id)}
                                >
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{order.user.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Produtos</div>
                                        <div style={{ fontWeight: '600' }}>{order.items.length} itens</div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Cupom</div>
                                        <div style={{ fontWeight: '600' }}>{order.couponCode || '-'}</div>
                                    </div>

                                    <div onClick={(e) => e.stopPropagation()}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={!!order.contactedAt}
                                                onChange={() => toggleContacted(order.id, order.contactedAt)}
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>
                                                {order.contactedAt
                                                    ? `Contato: ${new Date(order.contactedAt).toLocaleDateString()} ${new Date(order.contactedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                    : 'Contatar Cliente'}
                                            </span>
                                        </label>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Status Itens</div>
                                        <div style={{
                                            fontWeight: 'bold',
                                            color: pendingItems === 0 ? 'green' : 'orange'
                                        }}>
                                            {pendingItems === 0 ? '✅ Pronto para Envio' : `⏳ ${pendingItems} pendentes`}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '1.5rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: '#fff' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                            <div>
                                                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Detalhes do Cliente</h3>
                                                <p><strong>Email:</strong> {order.user.email}</p>
                                                <p><strong>Telefone:</strong> {order.user.phone || '-'}</p>
                                            </div>
                                            <div>
                                                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Resumo Financeiro</h3>
                                                <p>Subtotal: R$ {order.total.toFixed(2)}</p>
                                                <p>Desconto: - R$ {order.discount.toFixed(2)}</p>
                                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Total: R$ {order.finalTotal.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Itens do Pedido</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                                            {order.items.map((item) => (
                                                <div key={item.id} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '1rem',
                                                    background: '#f5f5f5',
                                                    borderRadius: 'var(--radius)',
                                                    border: item.ready ? '1px solid green' : '1px solid transparent'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        {item.customization?.preview && (
                                                            <div style={{ width: '50px', height: '50px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                                                                <img
                                                                    src={item.customization.preview}
                                                                    alt="Customization"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                                    onClick={() => {
                                                                        const w = window.open("");
                                                                        w.document.write('<img src="' + item.customization.preview + '" style="max-width: 100%"/>');
                                                                    }}
                                                                    title="Clique para ampliar"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                                            <span style={{ marginLeft: '1rem', color: 'var(--muted-foreground)' }}>x{item.quantity}</span>
                                                            {item.customization && (
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                                                                    🎨 Produto Personalizado
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                        {activeTab === 'active' && (
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.ready}
                                                                    onChange={() => toggleItemReady(item.id, item.ready)}
                                                                />
                                                                Separado
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {activeTab === 'active' && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                    className="btn btn-outline"
                                                    style={{ color: 'red', borderColor: 'red' }}
                                                >
                                                    Cancelar Pedido
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                                    className="btn btn-primary"
                                                    disabled={pendingItems > 0}
                                                    title={pendingItems > 0 ? "Separe todos os itens antes de finalizar" : ""}
                                                >
                                                    Finalizar Pedido (Mover para Histórico)
                                                </button>
                                            </div>
                                        )}

                                        {activeTab === 'history' && (
                                            <div style={{ textAlign: 'right', color: 'var(--muted-foreground)' }}>
                                                Pedido finalizado em: {order.completedAt ? new Date(order.completedAt).toLocaleString() : '-'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
