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
    const [couponData, setCouponData] = useState(null);
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
        if (cart.length === 0 && !orderSuccess) {
            router.push('/products');
            return;
        }

        if (session?.user?.email) {
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
                applyCoupon(data.coupon);
                setCouponCode(data.coupon.code);
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

        if (userDiscount.eligible) {
            appliedUserDiscount = subtotal * (userDiscount.percentage / 100);
        }

        if (couponData) {
            let currentCouponValue = 0;
            if (couponData.productId) {
                const targetItem = cart.find(item => item.id === couponData.productId);
                if (targetItem) {
                    const itemTotal = targetItem.price * targetItem.quantity;
                    if (couponData.type === 'percentage') {
                        currentCouponValue = itemTotal * (couponData.discount / 100);
                    } else {
                        currentCouponValue = couponData.discount;
                    }
                }
            } else {
                if (couponData.type === 'percentage') {
                    currentCouponValue = subtotal * (couponData.discount / 100);
                } else {
                    currentCouponValue = couponData.discount;
                }
            }
            appliedCouponDiscount = currentCouponValue;
        }

        if (couponData) {
            if (couponData.cumulative) {
                totalDiscount = appliedUserDiscount + appliedCouponDiscount;
            } else {
                if (appliedCouponDiscount > appliedUserDiscount) {
                    totalDiscount = appliedCouponDiscount;
                    appliedUserDiscount = 0;
                } else {
                    totalDiscount = appliedUserDiscount;
                    appliedCouponDiscount = 0;
                }
            }
        } else {
            totalDiscount = appliedUserDiscount;
        }

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
                window.scrollTo(0, 0);
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
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    fontSize: '5rem',
                    marginBottom: '1.5rem',
                    animation: 'bounce 1s infinite'
                }}>🎉</div>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Solicitação Recebida!
                </h1>
                <div className="glass" style={{
                    padding: '2.5rem',
                    borderRadius: 'var(--radius)',
                    maxWidth: '600px',
                    width: '100%',
                    marginBottom: '2rem'
                }}>
                    <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--foreground)' }}>
                        Obrigado por escolher a Vanessa Yachiro Personalizados!
                    </p>
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                        Recebemos o seu pedido e nossa equipe entrará em contato em breve pelo <strong>WhatsApp</strong> ou <strong>Email</strong> para combinar o pagamento e a entrega.
                    </p>
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        fontWeight: '600'
                    }}>
                        Fique atento ao seu telefone! 📱
                    </div>
                </div>
                <button
                    onClick={() => router.push('/products')}
                    className="btn btn-primary"
                    style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                >
                    Continuar Comprando
                </button>
            </div>
        );
    }

    if (cart.length === 0) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Carregando...</div>;
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '2rem',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                Finalizar Solicitação
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>

                {/* Left Column: Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Guest Checkout Form */}
                    {!session?.user && (
                        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                👤 Seus Dados
                            </h2>
                            <p style={{ fontSize: '0.95rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                                Precisamos destes dados para entrar em contato sobre o pagamento e entrega.
                            </p>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {/* Nome */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--foreground)' }}>
                                        Nome Completo <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={guestData.name}
                                        onChange={(e) => {
                                            setGuestData({ ...guestData, name: e.target.value });
                                            setGuestErrors({ ...guestErrors, name: '' });
                                        }}
                                        style={{ width: '100%', borderColor: guestErrors.name ? '#ef4444' : undefined }}
                                        placeholder="Ex: Maria Silva"
                                    />
                                    {guestErrors.name && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>{guestErrors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--foreground)' }}>
                                        Email <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={guestData.email}
                                        onChange={(e) => {
                                            setGuestData({ ...guestData, email: e.target.value });
                                            setGuestErrors({ ...guestErrors, email: '' });
                                        }}
                                        style={{ width: '100%', borderColor: guestErrors.email ? '#ef4444' : undefined }}
                                        placeholder="Ex: maria@email.com"
                                    />
                                    {guestErrors.email && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>{guestErrors.email}</p>}
                                </div>

                                {/* Telefone */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--foreground)' }}>
                                        Telefone / WhatsApp <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={guestData.phone}
                                        onChange={(e) => {
                                            setGuestData({ ...guestData, phone: e.target.value });
                                            setGuestErrors({ ...guestErrors, phone: '' });
                                        }}
                                        style={{ width: '100%', borderColor: guestErrors.phone ? '#ef4444' : undefined }}
                                        placeholder="Ex: (11) 99999-9999"
                                    />
                                    {guestErrors.phone && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>{guestErrors.phone}</p>}
                                </div>

                                {/* Endereço (Opcional) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--foreground)' }}>
                                        Endereço de Entrega (Opcional)
                                    </label>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                placeholder="CEP"
                                                value={guestData.postalCode}
                                                onChange={(e) => setGuestData({ ...guestData, postalCode: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Estado"
                                                value={guestData.prefecture}
                                                onChange={(e) => setGuestData({ ...guestData, prefecture: e.target.value })}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Cidade"
                                            value={guestData.city}
                                            onChange={(e) => setGuestData({ ...guestData, city: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Bairro"
                                            value={guestData.town}
                                            onChange={(e) => setGuestData({ ...guestData, town: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Rua e Número"
                                            value={guestData.street}
                                            onChange={(e) => setGuestData({ ...guestData, street: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Complemento (Apto, Bloco)"
                                            value={guestData.building}
                                            onChange={(e) => setGuestData({ ...guestData, building: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {session?.user && (
                        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                👤 Seus Dados
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    color: 'white'
                                }}>
                                    {session.user.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{session.user.name}</p>
                                    <p style={{ color: 'var(--muted-foreground)' }}>{session.user.email}</p>
                                </div>
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                Usaremos seus dados de cadastro para contato.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🛍️ Resumo do Pedido
                        </h2>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
                            {cart.map((item) => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '1rem 0',
                                    borderBottom: '1px solid var(--border)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                            Qtd: {item.quantity}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '600' }}>
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Coupon Section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Código do Cupom"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    onClick={() => validateCoupon()}
                                    className="btn btn-outline"
                                    disabled={validatingCoupon || !couponCode.trim()}
                                    style={{ padding: '0.75rem 1rem' }}
                                >
                                    {validatingCoupon ? '...' : 'Aplicar'}
                                </button>
                            </div>

                            {/* Available Coupons */}
                            {availableCoupons && availableCoupons.length > 0 && !couponData && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {availableCoupons.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => validateCoupon(c.code)}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                border: '1px dashed #10b981',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                color: '#10b981',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {c.code}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {couponError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{couponError}</p>}
                            {couponData && <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '0.5rem' }}>✓ Cupom {couponData.code} aplicado!</p>}
                        </div>

                        {/* Totals */}
                        <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--muted-foreground)' }}>
                                <span>Subtotal:</span>
                                <span>{formatCurrency(totals.subtotal)}</span>
                            </div>

                            {userDiscount.eligible && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#3b82f6' }}>
                                    <span>Desc. Cliente ({userDiscount.percentage}%):</span>
                                    <span>- {formatCurrency(totals.userDiscountVal)}</span>
                                </div>
                            )}

                            {couponData && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#10b981' }}>
                                    <span>Cupom ({couponCode}):</span>
                                    <span>- {formatCurrency(totals.couponDiscountVal)}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '800', marginTop: '1rem', color: 'var(--foreground)' }}>
                                <span>Total:</span>
                                <span style={{
                                    background: 'var(--gradient-primary)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {formatCurrency(totals.finalTotal)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmitOrder}
                            className="btn btn-primary"
                            disabled={submitting}
                            style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}
                        >
                            {submitting ? 'Enviando...' : 'Enviar Solicitação de Pedido'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '1rem' }}>
                            Ao clicar, você concorda que o pagamento será combinado posteriormente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
