"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function GuestsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchGuests();
    }, [status, session, router]);

    const fetchGuests = async () => {
        try {
            const res = await fetch('/api/admin/guests');
            if (res.ok) {
                const data = await res.json();
                setGuests(data);
            }
        } catch (error) {
            console.error('Error fetching guests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteRegistration = (guest) => {
        setSelectedGuest(guest);
        setFormData({
            name: guest.name || '',
            email: guest.email || '',
            phone: guest.phone || '',
            postalCode: guest.address?.postalCode || '',
            prefecture: guest.address?.prefecture || '',
            city: guest.address?.city || '',
            town: guest.address?.town || '',
            street: guest.address?.street || '',
            building: guest.address?.building || '',
            classification: '',
            deserveDiscount: false,
            discountType: 'percentage',
            discountValue: 0
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/admin/guests/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestEmail: selectedGuest.email,
                    guestPhone: selectedGuest.phone,
                    userData: formData
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to complete registration');
            }

            alert(`Cadastro finalizado! ${data.migratedOrders} pedido(s) vinculado(s).`);
            setShowModal(false);
            fetchGuests();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    if (loading) return <p style={{ padding: '2rem' }}>Carregando convidados...</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    👥 Clientes Sem Cadastro
                </h1>
                <p style={{ color: '#666' }}>
                    Convidados que fizeram pedidos sem criar conta
                </p>
            </div>

            {guests.length === 0 ? (
                <div style={{
                    background: 'var(--card)',
                    padding: '3rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>
                        Nenhum cliente sem cadastro encontrado
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {guests.map((guest, index) => (
                        <div
                            key={index}
                            style={{
                                background: 'var(--card)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                padding: '1.5rem',
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                                gap: '1rem',
                                alignItems: 'center'
                            }}
                        >
                            {/* Guest Info */}
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                    {guest.name || 'Sem nome'}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                    {guest.email && <div>📧 {guest.email}</div>}
                                    {guest.phone && <div>📱 {guest.phone}</div>}
                                </div>
                            </div>

                            {/* Order Count */}
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                                    Pedidos
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    {guest.orderCount}
                                </div>
                            </div>

                            {/* Total Spent */}
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                                    Total Gasto
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {formatCurrency(guest.totalSpent)}
                                </div>
                            </div>

                            {/* Last Order */}
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                                    Último Pedido
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    {new Date(guest.lastOrderDate).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleCompleteRegistration(guest)}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    ✅ Finalizar Cadastro
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Complete Registration Modal */}
            {showModal && selectedGuest && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--card)',
                        borderRadius: 'var(--radius)',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '95%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: '1px solid var(--border)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            Finalizar Cadastro
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {/* Name */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)'
                                        }}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)'
                                        }}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)'
                                        }}
                                    />
                                </div>

                                {/* Classification */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Classificação
                                    </label>
                                    <select
                                        value={formData.classification}
                                        onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)'
                                        }}
                                    >
                                        <option value="">Padrão</option>
                                        <option value="VIP">VIP</option>
                                        <option value="Family">Família</option>
                                        <option value="Friend">Amigo</option>
                                        <option value="Loyal">Fiel</option>
                                    </select>
                                </div>

                                {/* Discount */}
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.deserveDiscount}
                                            onChange={(e) => setFormData({ ...formData, deserveDiscount: e.target.checked })}
                                        />
                                        Elegível para Desconto
                                    </label>

                                    {formData.deserveDiscount && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <select
                                                value={formData.discountType}
                                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    borderRadius: 'var(--radius)',
                                                    border: '1px solid var(--border)'
                                                }}
                                            >
                                                <option value="percentage">Porcentagem (%)</option>
                                                <option value="fixed">Valor Fixo (R$)</option>
                                            </select>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.discountValue}
                                                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    borderRadius: 'var(--radius)',
                                                    border: '1px solid var(--border)'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    padding: '0.75rem',
                                    background: '#fee',
                                    color: '#c00',
                                    borderRadius: 'var(--radius)',
                                    marginTop: '1rem',
                                    fontSize: '0.9rem'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setShowModal(false);
                                        setError('');
                                    }}
                                    disabled={submitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Finalizando...' : 'Finalizar Cadastro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
