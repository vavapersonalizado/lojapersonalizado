"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cart, getCartTotal, clearCart } = useCart();

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
                setCouponError(data.error || 'Cupom inválido');
                setCouponDiscount(0);
            }
        } catch (error) {
            setCouponError('Erro ao validar cupom');
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
                alert(data.error || 'Erro ao criar pedido');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao processar pedido');
        } finally {
            setSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Pedido Recebido!
                </h1>
                <div style={{
                    background: 'var(--muted)',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    marginBottom: '2rem'
                }}>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                        Obrigado por seu pedido! Nossa equipe entrará em contato em até <strong>24 horas</strong> para confirmar o prazo de entrega e a forma de pagamento.
                    </p>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        Você receberá todas as informações por email.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/products')}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem' }}
                >
                    Continuar Comprando
                </button>
            </div>
        );
    }

    if (cart.length === 0) {
        return <div style={{ padding: '2rem' }}>Carregando...</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                Finalizar Pedido
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
                    Resumo do Pedido
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
                                Quantidade: {item.quantity}
                            </div>
                        </div>
                        <div style={{ fontWeight: '600' }}>
                            R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Subtotal:</span>
                        <span>R$ {getCartTotal().toFixed(2)}</span>
                    </div>
                    {couponDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'green' }}>
                            <span>Desconto ({couponCode}):</span>
                            <span>- R$ {couponDiscount.toFixed(2)}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        <span>Total:</span>
                        <span style={{ color: 'var(--primary)' }}>R$ {calculateTotal().toFixed(2)}</span>
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
                    Cupom de Desconto
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Digite o código do cupom"
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
                        {validatingCoupon ? 'Validando...' : 'Aplicar'}
                    </button>
                </div>
                {couponError && (
                    <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {couponError}
                    </p>
                )}
                {couponDiscount > 0 && (
                    <p style={{ color: 'green', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        ✓ Cupom aplicado com sucesso!
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
                {submitting ? 'Processando...' : 'Confirmar Pedido'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '1rem' }}>
                Ao confirmar, você receberá um email com os detalhes do pedido.
            </p>
        </div>
    );
}
