"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (session?.user?.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchOrders();
    }, [session, status, router]);

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ffa500';
            case 'processing': return '#0066ff';
            case 'completed': return '#00aa00';
            case 'cancelled': return '#ff0000';
            default: return '#666';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'processing': return 'Em Processamento';
            case 'completed': return 'Concluído';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    if (loading) return <p style={{ padding: '2rem' }}>Carregando pedidos...</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                📦 Gerenciar Pedidos
            </h1>

            {orders.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'var(--muted)',
                    borderRadius: 'var(--radius)'
                }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)' }}>
                        Nenhum pedido encontrado
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            style={{
                                background: 'var(--card)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                padding: '1.5rem'
                            }}
                        >
                            {/* Order Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                marginBottom: '1rem',
                                paddingBottom: '1rem',
                                borderBottom: '1px solid var(--border)'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                        Pedido #{order.id.slice(0, 8)}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                                    </div>
                                </div>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        background: getStatusColor(order.status),
                                        color: 'white',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="pending">Pendente</option>
                                    <option value="processing">Em Processamento</option>
                                    <option value="completed">Concluído</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>

                            {/* Customer Info */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                    👤 Cliente
                                </h3>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div><strong>Nome:</strong> {order.user.name}</div>
                                    <div><strong>Email:</strong> {order.user.email}</div>
                                    {order.user.phone && (
                                        <div><strong>Telefone:</strong> {order.user.phone}</div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                    🛍️ Itens
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '0.5rem',
                                                background: 'var(--muted)',
                                                borderRadius: 'var(--radius)',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <span>
                                                {item.name} <strong>x{item.quantity}</strong>
                                            </span>
                                            <span style={{ fontWeight: '600' }}>
                                                R$ {(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Total */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span>Subtotal:</span>
                                    <span>R$ {order.total.toFixed(2)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'green' }}>
                                        <span>Desconto {order.couponCode ? `(${order.couponCode})` : ''}:</span>
                                        <span>- R$ {order.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    <span>Total:</span>
                                    <span style={{ color: 'var(--primary)' }}>R$ {order.finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
