"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cart, getCartTotal, clearCart, coupon, applyCoupon, availableCoupons } = useCart();
    const { t, formatCurrency } = useLanguage();

    const [couponCode, setCouponCode] = useState('');
    const [couponData, setCouponData] = useState(null); // { discount, type, cumulative, productId }
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const [userDiscount, setUserDiscount] = useState({ eligible: false, percentage: 0, classification: '' });
    const [loadingUser, setLoadingUser] = useState(true);

    // Guest checkout data
    const [guestData, setGuestData] = useState({
        name: '',
        email: '',
        phone: '',
        postalCode: '',
        prefecture: '',
        city: '',
        town: '',
        street: '',
        building: ''
    });
    const [guestErrors, setGuestErrors] = useState({});

    useEffect(() => {
        // Allow unauthenticated users for guest checkout
        if (cart.length === 0 && !orderSuccess) {
            router.push('/products');
            return;
        }

        if (session?.user?.email) {
            // Fetch full user profile to get discount info
            fetch(`/api/users/profile?email=${session.user.email}`)
                .then(res => res.json())
                .then(data => {
                    if (data.discountEligible) {
                        setUserDiscount({
                            eligible: true,
                            percentage: data.discountPercentage || 0,
                            classification: data.classification || ''
                        });
                    }
                    setLoadingUser(false);
                })
                .catch(err => {
                    console.error("Error fetching user profile:", err);
                    setLoadingUser(false);
                });
        } else {
            setLoadingUser(false);
        }
    }, [status, cart, router, orderSuccess, session]);

    useEffect(() => {
        if (coupon) {
            setCouponData(coupon);
            setCouponCode(coupon.code);
        }
    }, [coupon]);

    const validateCoupon = async (codeOverride = null) => {
        const codeToUse = codeOverride || couponCode;
        if (!codeToUse.trim()) return;

        setValidatingCoupon(true);
        setCouponError('');

        try {
            const res = await fetch(`/api/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: codeToUse,
                    cartItems: cart
                })
            });
            const data = await res.json();

            if (res.ok) {
                setCouponData(data.coupon);
                applyCoupon(data.coupon); // Sync with context
                setCouponCode(data.coupon.code); // Ensure code matches applied coupon
                setCouponError('');
            } else {
                setCouponError(data.error || t('checkout.coupon_invalid'));
                setCouponData(null);
            }
        } catch {
            setCouponError(t('checkout.coupon_error'));
            setCouponData(null);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const calculateTotals = () => {
        const subtotal = getCartTotal();
        let totalDiscount = 0;
        let appliedUserDiscount = 0;
        let appliedCouponDiscount = 0;

        // 1. Calculate User Discount
        if (userDiscount.eligible) {
            appliedUserDiscount = subtotal * (userDiscount.percentage / 100);
        }

        // 2. Calculate Coupon Discount
        if (couponData) {
            let currentCouponValue = 0;

            if (couponData.productId) {
                // Product specific coupon
                const targetItem = cart.find(item => item.id === couponData.productId);
                if (targetItem) {
                    const itemTotal = targetItem.price * targetItem.quantity;
                    if (couponData.type === 'percentage') {
                        currentCouponValue = itemTotal * (couponData.discount / 100);
                    } else {
                        currentCouponValue = couponData.discount; // Fixed amount per order or per item? Assuming per order for now, but if it's product specific usually it's per item. Let's assume fixed amount total for simplicity unless specified.
                        // Actually, if it's a fixed discount on a product, it usually applies once or per item. Let's assume it applies once to the total of that item line.
                    }
                }
            } else {
                // General coupon
                if (couponData.type === 'percentage') {
                    currentCouponValue = subtotal * (couponData.discount / 100);
                } else {
                    currentCouponValue = couponData.discount;
                }
            }

            appliedCouponDiscount = currentCouponValue;
        }

        // 3. Combine Discounts
        if (couponData) {
            if (couponData.cumulative) {
                // Cumulative: Add both
                totalDiscount = appliedUserDiscount + appliedCouponDiscount;
            } else {
                // Not Cumulative: Use the larger one
                // Wait, user said: "pode acumular, a não ser que... não acumulativo".
                // If NOT cumulative, it shouldn't stack with user discount.
                // Usually this means you pick the best one.
                if (appliedCouponDiscount > appliedUserDiscount) {
                    totalDiscount = appliedCouponDiscount;
                    appliedUserDiscount = 0; // Reset user discount for display purposes if we want to show what was applied
                } else {
                    totalDiscount = appliedUserDiscount;
                    appliedCouponDiscount = 0; // Coupon not applied effectively
                }
            }
        } else {
            totalDiscount = appliedUserDiscount;
        }

        // Cap discount at subtotal
        if (totalDiscount > subtotal) totalDiscount = subtotal;

        return {
            subtotal,
            userDiscountVal: appliedUserDiscount,
            couponDiscountVal: appliedCouponDiscount,
            totalDiscount,
            finalTotal: subtotal - totalDiscount
        };
    };

    const totals = calculateTotals();

    const handleSubmitOrder = async () => {
        // Validate guest data if not logged in
        if (!session?.user) {
            const errors = {};
            if (!guestData.name.trim()) errors.name = 'Nome é obrigatório';
            if (!guestData.email.trim()) errors.email = 'Email é obrigatório';
            if (!guestData.phone.trim()) errors.phone = 'Telefone é obrigatório';

            if (Object.keys(errors).length > 0) {
                setGuestErrors(errors);
                return;
            }
        }

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
                        quantity: item.quantity,
                        customization: item.customization || null
                    })),
                    couponCode: couponData ? couponCode : null,
                    discount: totals.totalDiscount,
                    total: totals.subtotal,
                    finalTotal: totals.finalTotal,
                    guestData: !session?.user ? guestData : null
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
                    <p style={{ color: '#000000' }}>
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

            {/* Guest Checkout Form */}
            {!session?.user && (
                <div style={{
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Seus Dados
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#000000', marginBottom: '1rem' }}>
                        Preencha seus dados para finalizar o pedido
                    </p>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {/* Nome */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Nome <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={guestData.name}
                                onChange={(e) => {
                                    setGuestData({ ...guestData, name: e.target.value });
                                    setGuestErrors({ ...guestErrors, name: '' });
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    border: `1px solid ${guestErrors.name ? 'red' : 'var(--border)'}`,
                                    fontSize: '1rem'
                                }}
                                placeholder="Seu nome completo"
                            />
                            {guestErrors.name && (
                                <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    {guestErrors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Email <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="email"
                                value={guestData.email}
                                onChange={(e) => {
                                    setGuestData({ ...guestData, email: e.target.value });
                                    setGuestErrors({ ...guestErrors, email: '' });
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    border: `1px solid ${guestErrors.email ? 'red' : 'var(--border)'}`,
                                    fontSize: '1rem'
                                }}
                                placeholder="seu@email.com"
                            />
                            {guestErrors.email && (
                                <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    {guestErrors.email}
                                </p>
                            )}
                        </div>

                        {/* Telefone */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Telefone <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="tel"
                                value={guestData.phone}
                                onChange={(e) => {
                                    setGuestData({ ...guestData, phone: e.target.value });
                                    setGuestErrors({ ...guestErrors, phone: '' });
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    border: `1px solid ${guestErrors.phone ? 'red' : 'var(--border)'}`,
                                    fontSize: '1rem'
                                }}
                                placeholder="(00) 00000-0000"
                            />
                            {guestErrors.phone && (
                                <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    {guestErrors.phone}
                                </p>
                            )}
                        </div>

                        {/* Endereço (Opcional) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="CEP (opcional)"
                                value={guestData.postalCode}
                                onChange={(e) => setGuestData({ ...guestData, postalCode: e.target.value })}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    fontSize: '1rem'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Província (opcional)"
                                value={guestData.prefecture}
                                onChange={(e) => setGuestData({ ...guestData, prefecture: e.target.value })}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Cidade (opcional)"
                            value={guestData.city}
                            onChange={(e) => setGuestData({ ...guestData, city: e.target.value })}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Bairro (opcional)"
                            value={guestData.town}
                            onChange={(e) => setGuestData({ ...guestData, town: e.target.value })}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Rua (opcional)"
                            value={guestData.street}
                            onChange={(e) => setGuestData({ ...guestData, street: e.target.value })}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Edifício/Apartamento (opcional)"
                            value={guestData.building}
                            onChange={(e) => setGuestData({ ...guestData, building: e.target.value })}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>
            )}

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
                            <div style={{ fontSize: '0.9rem', color: '#000000' }}>
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
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>

                    {/* User Discount Display */}
                    {userDiscount.eligible && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'blue' }}>
                            <span>
                                Desconto Cliente ({userDiscount.classification || 'VIP'} - {userDiscount.percentage}%)
                                {couponData && !couponData.cumulative && totals.userDiscountVal === 0 && " (Substituído pelo Cupom)"}
                            </span>
                            <span>- {formatCurrency(totals.userDiscountVal)}</span>
                        </div>
                    )}

                    {/* Coupon Discount Display */}
                    {couponData && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'green' }}>
                            <span>
                                Cupom ({couponCode})
                                {couponData.productId && " (Produto Específico)"}
                                {!couponData.cumulative && " (Não Acumulativo)"}
                                {!couponData.cumulative && totals.couponDiscountVal === 0 && " (Menor que desc. cliente)"}
                            </span>
                            <span>- {formatCurrency(totals.couponDiscountVal)}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        <span>{t('common.total')}:</span>
                        <span style={{ color: 'var(--primary)' }}>{formatCurrency(totals.finalTotal)}</span>
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
                        onClick={() => validateCoupon()}
                        className="btn btn-outline"
                        disabled={validatingCoupon || !couponCode.trim()}
                    >
                        {validatingCoupon ? t('checkout.validating') : t('checkout.apply')}
                    </button>
                </div>

                {/* Available Coupons List */}
                {availableCoupons && availableCoupons.length > 0 && !couponData && (
                    <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', color: '#000000', marginBottom: '0.5rem' }}>
                            Cupons disponíveis para você:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {availableCoupons.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => validateCoupon(c.code)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        background: '#f0fdf4',
                                        border: '1px dashed #86efac',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: '#000000',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <strong>{c.code}</strong>
                                    <span>
                                        {c.type === 'percentage' ? `${c.discount}% OFF` : `R$ ${c.discount} OFF`}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {couponError && (
                    <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {couponError}
                    </p>
                )}
                {couponData && (
                    <p style={{ color: 'green', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        ✓ {t('checkout.coupon_applied')} ({couponData.code})
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

            <p style={{ textAlign: 'center', color: '#000000', fontSize: '0.9rem', marginTop: '1rem' }}>
                {t('checkout.email_notice')}
            </p>
        </div>
    );
}
