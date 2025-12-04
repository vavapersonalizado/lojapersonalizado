"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cart, getCartTotal, clearCart } = useCart();
    const { t, formatCurrency } = useLanguage();

    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
        if (cart.length === 0 && !orderSuccess) {
            router.push('/products');
        }
    }, [status, cart, router, orderSuccess]);

    const validateCoupon = async () => {
        if (!couponCode.trim()) return;

        setValidatingCoupon(true);
        setCouponError('');

        try {
            const res = await fetch(`/api/coupons/validate?code=${couponCode}`);
            const data = await res.json();

            if (res.ok) {
                setCouponDiscount(data.discount);
                setCouponError('');
            } else {
                setCouponError(data.error || t('checkout.coupon_invalid'));
                setCouponDiscount(0);
            }
        } catch {
            setCouponError(t('checkout.coupon_error'));
            setCouponDiscount(0);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const calculateTotal = () => {
        const subtotal = getCartTotal();
        const discount = couponDiscount;
        return subtotal - discount;
    };

    const handleSubmitOrder = async () => {
        if (!session?.user) return;

        setSubmitting(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    couponCode: couponCode || null,
                    discount: couponDiscount,
                    total: getCartTotal(),
                    finalTotal: calculateTotal()
                })
            });

            if (res.ok) {
                clearCart();
                setOrderSuccess(true);
            } else {
                const data = await res.json();
                alert(data.error || t('checkout.order_error'));
            }
        } catch {
            alert(t('checkout.order_error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    {t('order.received')}
                </h1>
                <div style={{
                    background: 'var(--muted)',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    marginBottom: '2rem'
                }}>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                        {t('order.thank_you')}
                    </p>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        {t('order.email_sent')}
                    </p>
                </div>
                <button
                    onClick={() => router.push('/products')}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem' }}
                >
                    {t('cart.continue_shopping')}
                </button>
            </div>
        );
    }

    if (cart.length === 0) {
        return <div style={{ padding: '2rem' }}>{t('common.loading')}</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                {t('checkout.title')}
            </h1>

            {/* Order Summary */}
            <div style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    {t('checkout.order_summary')}
                </h2>

                {cart.map((item) => (
                    <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <div>
                            <div style={{ fontWeight: '500' }}>{item.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                {t('common.quantity')}: {item.quantity}
                            </div>
                        </div>
                        <div style={{ fontWeight: '600' }}>
                            {formatCurrency(item.price * item.quantity)}
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>{t('common.subtotal')}:</span>
                        <span>{formatCurrency(getCartTotal())}</span>
                    </div>
                    {couponDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'green' }}>
                            <span>{t('common.discount')} ({couponCode}):</span>
                            <span>- {formatCurrency(couponDiscount)}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        <span>{t('common.total')}:</span>
                        <span style={{ color: 'var(--primary)' }}>{formatCurrency(calculateTotal())}</span>
                    </div>
                </div>
            </div>

            {/* Coupon Section */}
            <div style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    {t('checkout.coupon_code')}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder={t('checkout.enter_coupon')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            background: 'var(--background)'
                        }}
                    />
                    <button
                        onClick={validateCoupon}
                        className="btn btn-outline"
                        disabled={validatingCoupon || !couponCode.trim()}
                    >
                        {validatingCoupon ? t('checkout.validating') : t('checkout.apply')}
                    </button>
                </div>
                {couponError && (
                    <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {couponError}
                    </p>
                )}
                {couponDiscount > 0 && (
                    <p style={{ color: 'green', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        ✓ {t('checkout.coupon_applied')}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmitOrder}
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            >
                {submitting ? t('checkout.processing') : t('checkout.confirm_order')}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '1rem' }}>
                {t('checkout.email_notice')}
            </p>
        </div>
    );
}
