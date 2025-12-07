"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CouponsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        code: '',
        discount: '',
        type: 'percentage',
        maxUses: '',
        expiresAt: '',
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const fetchCoupons = () => {
        fetch('/api/coupons')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch coupons');
                return res.json();
            })
            .then(data => {
                setCoupons(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (session?.user?.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchCoupons();
    }, [session, status, router]);

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este cupom?')) return;

        try {
            const res = await fetch(`/api/coupons?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete coupon');

            fetchCoupons();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (coupon) => {
        setFormData({
            id: coupon.id,
            code: coupon.code,
            discount: coupon.discount,
            type: coupon.type,
            maxUses: coupon.maxUses || '',
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
            isActive: coupon.isActive
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const method = isEditing ? 'PATCH' : 'POST';
            const res = await fetch('/api/coupons', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save coupon');
            }

            fetchCoupons();
            setShowModal(false);
            setFormData({
                id: null,
                code: '',
                discount: '',
                type: 'percentage',
                maxUses: '',
                expiresAt: '',
                isActive: true
            });
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const openNewCouponModal = () => {
        setFormData({
            id: null,
            code: '',
            discount: '',
            type: 'percentage',
            maxUses: '',
            expiresAt: '',
            isActive: true
        });
        setIsEditing(false);
        setShowModal(true);
    };

    if (loading) return <p style={{ padding: '2rem' }}>Carregando cupons...</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Gerenciar Cupons</h1>
                <button
                    className="btn btn-primary"
                    onClick={openNewCouponModal}
                >
                    ➕ Criar Cupom
                </button>
            </div>

            <div style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                overflowX: 'auto'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: 'var(--muted)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Código</th>
                            <th style={{ padding: '1rem' }}>Desconto</th>
                            <th style={{ padding: '1rem' }}>Tipo</th>
                            <th style={{ padding: '1rem' }}>Usos</th>
                            <th style={{ padding: '1rem' }}>Expira em</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    Nenhum cupom encontrado.
                                </td>
                            </tr>
                        ) : (
                            coupons.map(coupon => (
                                <tr key={coupon.id} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{coupon.code}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {coupon.type === 'fixed' ? '¥' : ''}
                                        {coupon.discount}
                                        {coupon.type === 'percentage' ? '%' : ''}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {coupon.type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {coupon.usedCount} / {coupon.maxUses || '∞'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Nunca'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '999px',
                                            fontSize: '0.8rem',
                                            background: coupon.isActive ? '#dcfce7' : '#fee2e2',
                                            color: coupon.isActive ? '#166534' : '#991b1b'
                                        }}>
                                            {coupon.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                                            onClick={() => handleEdit(coupon)}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', color: 'red', borderColor: 'red' }}
                                            onClick={() => handleDelete(coupon.id)}
                                        >
                                            🗑️ Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
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
                        maxWidth: '500px',
                        width: '90%',
                        border: '1px solid var(--border)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            {isEditing ? 'Editar Cupom' : 'Criar Novo Cupom'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Código do Cupom *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="EX: PROMO10"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Tipo
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    >
                                        <option value="percentage">Porcentagem (%)</option>
                                        <option value="fixed">Valor Fixo (¥)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Valor *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step={formData.type === 'percentage' ? '1' : '0.01'}
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Limite de Usos
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Ilimitado"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Validade
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    Cupom Ativo
                                </label>
                            </div>

                            {error && (
                                <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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
                                    {submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Cupom')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
