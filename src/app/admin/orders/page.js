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
    const [editingNotes, setEditingNotes] = useState({}); // { orderId: notesText }

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

    const updateOrderNotes = async (orderId, notes) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            });

            if (res.ok) {
                fetchOrders();
                setEditingNotes({ ...editingNotes, [orderId]: notes });
            }
        } catch (error) {
            console.error('Error updating notes:', error);
        }
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
                        color: activeTab === 'active' ? 'var(--primary)' : '#000000',
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
                        color: activeTab === 'history' ? 'var(--primary)' : '#000000',
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
                    <p style={{ fontSize: '1.2rem', color: '#000000' }}>
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
                                        <div style={{ fontWeight: 'bold' }}>
                                            {order.user ? order.user.name : order.guestName}
                                            {!order.user && <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem' }}>(Convidado)</span>}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#000000' }}>
                                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: '#000000' }}>Produtos</div>
                                        <div style={{ fontWeight: '600' }}>{order.items.length} itens</div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: '#000000' }}>Cupom</div>
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
                                                    ? `✅ Cliente Contatado (${new Date(order.contactedAt).toLocaleDateString()} ${new Date(order.contactedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                                                    : '⏳ Cliente Contatado'}
                                            </span>
                                        </label>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: '#000000' }}>Status Itens</div>
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
                                                <p><strong>Nome:</strong> {order.user ? order.user.name : order.guestName}</p>
                                                <p><strong>Email:</strong> {order.user ? order.user.email : order.guestEmail}</p>
                                                <p><strong>Telefone:</strong> {order.user ? (order.user.phone || '-') : (order.guestPhone || '-')}</p>
                                                {!order.user && order.guestAddress && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <strong>Endereço:</strong>
                                                        <p style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>
                                                            {order.guestAddress.postalCode && `CEP: ${order.guestAddress.postalCode}`}<br />
                                                            {order.guestAddress.prefecture && `${order.guestAddress.prefecture}`}
                                                            {order.guestAddress.city && `, ${order.guestAddress.city}`}<br />
                                                            {order.guestAddress.town && `${order.guestAddress.town}`}
                                                            {order.guestAddress.street && `, ${order.guestAddress.street}`}<br />
                                                            {order.guestAddress.building && order.guestAddress.building}
                                                        </p>
                                                    </div>
                                                )}
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
                                                    border: item.ready ? '2px solid green' : '1px solid #ddd'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                        {/* Product Thumbnail */}
                                                        {item.customization?.preview ? (
                                                            <div style={{ width: '60px', height: '60px', border: '2px solid var(--primary)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                                                <img
                                                                    src={item.customization.preview}
                                                                    alt="Customization"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
                                                                    onClick={() => {
                                                                        const w = window.open("");
                                                                        w.document.write('<img src="' + item.customization.preview + '" style="max-width: 100%"/>');
                                                                    }}
                                                                    title="Clique para ampliar"
                                                                />
                                                            </div>
                                                        ) : item.product?.images?.[0] ? (
                                                            <div style={{ width: '60px', height: '60px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                                                <img
                                                                    src={item.product.images[0]}
                                                                    alt={item.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div style={{ width: '60px', height: '60px', border: '1px solid #ddd', borderRadius: '4px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <span style={{ fontSize: '0.7rem', color: '#666' }}>Sem foto</span>
                                                            </div>
                                                        )}

                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.name}</div>
                                                            {item.product?.sku && (
                                                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                                                                    Código: {item.product.sku}
                                                                </div>
                                                            )}
                                                            <div style={{ fontSize: '0.9rem', color: '#000', fontWeight: '600' }}>
                                                                Quantidade: <span style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>×{item.quantity}</span>
                                                            </div>
                                                            {item.customization && (
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                                                                    🎨 Produto Personalizado
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                        {activeTab === 'active' && (
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #ddd', whiteSpace: 'nowrap' }}>
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

                                        {/* Observações */}
                                        <div style={{ marginBottom: '2rem' }}>
                                            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Observações</h3>
                                            <textarea
                                                value={editingNotes[order.id] !== undefined ? editingNotes[order.id] : (order.notes || '')}
                                                onChange={(e) => setEditingNotes({ ...editingNotes, [order.id]: e.target.value })}
                                                placeholder="Adicione observações sobre este pedido..."
                                                style={{
                                                    width: '100%',
                                                    minHeight: '80px',
                                                    padding: '0.75rem',
                                                    borderRadius: 'var(--radius)',
                                                    border: '1px solid var(--border)',
                                                    fontSize: '0.95rem',
                                                    fontFamily: 'inherit',
                                                    resize: 'vertical'
                                                }}
                                            />
                                            {editingNotes[order.id] !== undefined && editingNotes[order.id] !== (order.notes || '') && (
                                                <button
                                                    onClick={() => updateOrderNotes(order.id, editingNotes[order.id])}
                                                    className="btn btn-primary"
                                                    style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}
                                                >
                                                    💾 Salvar Observações
                                                </button>
                                            )}
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
                                            <div style={{ textAlign: 'right', color: '#000000' }}>
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
