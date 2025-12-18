"use client";

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function CartPage() {
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

    const handleCheckout = () => {
        router.push('/checkout');
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', minHeight: '80vh' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                🛒 {t('cart.title')}
            </h1>

            {cart.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 1rem',
                    color: 'var(--foreground)',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                    <p style={{ fontSize: '1.2rem' }}>{t('cart.empty')}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-primary"
                        style={{ marginTop: '2rem', padding: '0.75rem 2rem' }}
                    >
                        Continuar Comprando
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>

                    {/* Cart Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    padding: '1.5rem',
                                    background: 'var(--card)',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    alignItems: 'center'
                                }}
                            >
                                {/* Product Image */}
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: 'var(--background)',
                                    borderRadius: 'var(--radius)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    overflow: 'hidden',
                                    flexShrink: 0
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
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>
                                        {item.name}
                                    </h3>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                                        {formatCurrency(item.price)}
                                    </p>

                                    {/* Variants Info */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        {item.customization?.size && (
                                            <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                                Tamanho: {item.customization.size}
                                            </span>
                                        )}
                                        {item.customization?.color && (
                                            <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                                Cor: {item.customization.color}
                                            </span>
                                        )}
                                    </div>

                                    {item.customization && !item.customization.size && !item.customization.color && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', background: 'rgba(0,0,0,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', width: 'fit-content' }}>
                                            Personalizado
                                        </span>
                                    )}
                                </div>

                                {/* Quantity Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.customization)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '1rem' }}
                                    >
                                        −
                                    </button>
                                    <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: '600', fontSize: '1.1rem' }}>
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.customization)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '1rem' }}
                                        disabled={item.stock && item.quantity >= item.stock}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromCart(item.id, item.customization)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--destructive)',
                                        cursor: 'pointer',
                                        fontSize: '1.5rem',
                                        padding: '0.5rem'
                                    }}
                                    title={t('common.delete')}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="btn btn-outline"
                            style={{ width: 'fit-content', alignSelf: 'flex-end', marginTop: '1rem' }}
                        >
                            {t('cart.clear')}
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div style={{
                        padding: '2rem',
                        background: 'var(--card)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        position: 'sticky',
                        top: '2rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Resumo do Pedido</h2>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                <span>Subtotal:</span>
                                <span>{formatCurrency(getSubtotal())}</span>
                            </div>

                            {coupon && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: 'green' }}>
                                    <span>Desconto ({coupon.code}):</span>
                                    <span>- {formatCurrency(getDiscountAmount())}</span>
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--border)'
                            }}>
                                <span>{t('common.total')}:</span>
                                <span style={{ color: 'var(--primary)' }}>
                                    {formatCurrency(getCartTotal())}
                                </span>
                            </div>
                        </div>

                        {/* Coupon Input */}
                        <div style={{ marginBottom: '2rem' }}>
                            {coupon ? (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#dcfce7',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid #86efac'
                                }}>
                                    <span style={{ color: 'var(--foreground)', fontSize: '1rem' }}>
                                        Cupom <b>{coupon.code}</b> aplicado!
                                    </span>
                                    <button
                                        onClick={removeCoupon}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--foreground)',
                                            cursor: 'pointer',
                                            fontSize: '1.5rem',
                                            padding: '0 0.5rem'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Código do cupom"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius)',
                                                border: '1px solid var(--border)',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleApplyCoupon()}
                                            disabled={validatingCoupon || !couponCode}
                                            className="btn btn-outline"
                                            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                                        >
                                            {validatingCoupon ? '...' : 'Aplicar'}
                                        </button>
                                    </div>

                                    {/* Available Coupons List */}
                                    {availableCoupons && availableCoupons.length > 0 && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                                                Cupons disponíveis para você:
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {availableCoupons.map(c => (
                                                    <div key={c.id} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '0.75rem',
                                                        background: '#f0fdf4',
                                                        border: '1px dashed #86efac',
                                                        borderRadius: '4px'
                                                    }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontWeight: 'bold', color: 'var(--foreground)', fontSize: '1rem' }}>{c.code}</span>
                                                            <span style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>
                                                                {c.type === 'percentage' ? `${c.discount}% OFF` : `R$ ${c.discount} OFF`}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleApplyCoupon(c.code)}
                                                            style={{
                                                                fontSize: '0.9rem',
                                                                padding: '0.5rem 1rem',
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
                                <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    {couponError}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
                        >
                            {t('cart.checkout')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
