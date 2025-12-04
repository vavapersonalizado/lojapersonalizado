"use client";

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isOpen, onClose }) {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const router = useRouter();

    if (!isOpen) return null;

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1000
            }}
            onClick={onClose}
        >
            <div
                style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '450px',
                    maxWidth: '90vw',
                    background: 'var(--card)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        🛒 Carrinho
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {cart.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem 1rem',
                            color: 'var(--muted-foreground)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                            <p>Seu carrinho está vazio</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        padding: '1rem',
                                        background: 'var(--muted)',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)'
                                    }}
                                >
                                    {/* Product Image */}
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'var(--background)',
                                        borderRadius: 'var(--radius)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem'
                                    }}>
                                        {item.images && item.images[0] ? (
                                            <img
                                                src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                                                alt={item.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--radius)'
                                                }}
                                            />
                                        ) : (
                                            '📦'
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                            {item.name}
                                        </h3>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                                            R$ {item.price.toFixed(2)}
                                        </p>

                                        {/* Quantity Controls */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                                            >
                                                −
                                            </button>
                                            <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: '600' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                                                disabled={item.stock && item.quantity >= item.stock}
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{
                                                    marginLeft: 'auto',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--destructive)',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem'
                                                }}
                                                title="Remover"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div style={{
                        padding: '1.5rem',
                        borderTop: '1px solid var(--border)',
                        background: 'var(--muted)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            fontSize: '1.25rem',
                            fontWeight: 'bold'
                        }}>
                            <span>Total:</span>
                            <span style={{ color: 'var(--primary)' }}>
                                R$ {getCartTotal().toFixed(2)}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem' }}
                        >
                            Finalizar Pedido
                        </button>
                        <button
                            onClick={clearCart}
                            className="btn btn-outline"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                        >
                            Limpar Carrinho
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
