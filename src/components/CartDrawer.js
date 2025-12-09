"use client";

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

import { useState } from 'react';

export default function CartDrawer({ isOpen, onClose }) {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart, coupon, applyCoupon, removeCoupon, getSubtotal, getDiscountAmount, availableCoupons } = useCart();
    const router = useRouter();
    const { t, formatCurrency } = useLanguage();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    const handleApplyCoupon = async (codeOverride = null) => {
        const codeToUse = codeOverride || couponCode;
        if (!codeToUse) return;
        setValidatingCoupon(true);
        setCouponError('');

        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: codeToUse })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Cupom inválido');
            }

            applyCoupon(data.coupon);
            setCouponCode('');
        } catch (err) {
            setCouponError(err.message);
        } finally {
            setValidatingCoupon(false);
        }
    };

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
                        🛒 {t('cart.title')}
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
                            <p>{t('cart.empty')}</p>
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
                                        fontSize: '2rem',
                                        overflow: 'hidden'
                                    }}>
                                        {item.customization?.preview ? (
                                            <img
                                                src={item.customization.preview}
                                                alt={item.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: 'var(--radius)'
                                                }}
                                            />
                                        ) : (item.images && item.images[0] ? (
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
                                        ))}
                                    </div>

                                    {/* Product Info */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                            {item.name}
                                        </h3>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                                            {formatCurrency(item.price)}
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
                                                title={t('common.delete')}
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
                            flexDirection: 'column',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                                <span>Subtotal:</span>
                                <span>{formatCurrency(getSubtotal())}</span>
                            </div>

                            {coupon && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'green' }}>
                                    <span>Desconto ({coupon.code}):</span>
                                    <span>- {formatCurrency(getDiscountAmount())}</span>
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                marginTop: '0.5rem',
                                paddingTop: '0.5rem',
                                borderTop: '1px solid var(--border)'
                            }}>
                                <span>{t('common.total')}:</span>
                                <span style={{ color: 'var(--primary)' }}>
                                    {formatCurrency(getCartTotal())}
                                </span>
                            </div>
                        </div>

                        {/* Coupon Input */}
                        <div style={{ marginBottom: '1rem' }}>
                            {coupon ? (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#dcfce7',
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid #86efac'
                                }}>
                                    <span style={{ color: '#166534', fontSize: '0.9rem' }}>
                                        Cupom <b>{coupon.code}</b> aplicado!
                                    </span>
                                    <button
                                        onClick={removeCoupon}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#166534',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            padding: '0 0.5rem'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Código do cupom"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                borderRadius: 'var(--radius)',
                                                border: '1px solid var(--border)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleApplyCoupon()}
                                            disabled={validatingCoupon || !couponCode}
                                            className="btn btn-outline"
                                            style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                        >
                                            {validatingCoupon ? '...' : 'Aplicar'}
                                        </button>
                                    </div>

                                    {/* Available Coupons List */}
                                    {availableCoupons && availableCoupons.length > 0 && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                                Cupons disponíveis para você:
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {availableCoupons.map(c => (
                                                    <div key={c.id} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '0.5rem',
                                                        background: '#f0fdf4',
                                                        border: '1px dashed #86efac',
                                                        borderRadius: '4px'
                                                    }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontWeight: 'bold', color: '#166534', fontSize: '0.9rem' }}>{c.code}</span>
                                                            <span style={{ fontSize: '0.8rem', color: '#15803d' }}>
                                                                {c.type === 'percentage' ? `${c.discount}% OFF` : `R$ ${c.discount} OFF`}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleApplyCoupon(c.code)}
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                padding: '0.25rem 0.5rem',
                                                                background: '#166534',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Usar
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {couponError && (
                                <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    {couponError}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem' }}
                        >
                            {t('cart.checkout')}
                        </button>
                        <button
                            onClick={clearCart}
                            className="btn btn-outline"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                        >
                            {t('cart.clear')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
