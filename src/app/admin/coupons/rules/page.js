"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CouponRulesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        type: '',
        discountType: 'percentage',
        discountValue: '',
        codePrefix: '',
        expirationDays: '',
        active: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const fetchRules = () => {
        fetch('/api/admin/coupon-rules')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch rules');
                return res.json();
            })
            .then(data => {
                setRules(Array.isArray(data) ? data : []);
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
        fetchRules();
    }, [session, status, router]);

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
        try {
            const res = await fetch(`/api/admin/coupon-rules/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete rule');
            fetchRules();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (rule) => {
        setFormData({
            id: rule.id,
            type: rule.type,
            discountType: rule.discountType,
            discountValue: rule.discountValue,
            codePrefix: rule.codePrefix,
            expirationDays: rule.expirationDays || '',
            active: rule.active
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const url = isEditing ? `/api/admin/coupon-rules/${formData.id}` : '/api/admin/coupon-rules';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save rule');

            fetchRules();
            setShowModal(false);
            resetForm();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            type: '',
            discountType: 'percentage',
            discountValue: '',
            codePrefix: '',
            expirationDays: '',
            active: true
        });
        setIsEditing(false);
    };

    const openNewRuleModal = () => {
        resetForm();
        setShowModal(true);
    };

    if (loading) return <p style={{ padding: '2rem' }}>Carregando regras...</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <button
                        onClick={() => router.push('/admin/coupons')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}
                    >
                        ← Voltar para Cupons
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Regras Automáticas</h1>
                </div>
                <button className="btn btn-primary" onClick={openNewRuleModal}>
                    ➕ Nova Regra
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
                            <th style={{ padding: '1rem' }}>Tipo (Gatilho)</th>
                            <th style={{ padding: '1rem' }}>Prefixo</th>
                            <th style={{ padding: '1rem' }}>Desconto</th>
                            <th style={{ padding: '1rem' }}>Validade (Dias)</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    Nenhuma regra encontrada.
                                </td>
                            </tr>
                        ) : (
                            rules.map(rule => (
                                <tr key={rule.id} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{rule.type}</td>
                                    <td style={{ padding: '1rem' }}>{rule.codePrefix}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {rule.discountType === 'fixed' ? '¥' : ''}
                                        {rule.discountValue}
                                        {rule.discountType === 'percentage' ? '%' : ''}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{rule.expirationDays || 'Ilimitado'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '999px',
                                            fontSize: '0.8rem',
                                            background: rule.active ? '#dcfce7' : '#fee2e2',
                                            color: rule.active ? '#166534' : '#991b1b'
                                        }}>
                                            {rule.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                                            onClick={() => handleEdit(rule)}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', color: 'red', borderColor: 'red' }}
                                            onClick={() => handleDelete(rule.id)}
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
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--card)', borderRadius: 'var(--radius)', padding: '2rem',
                        maxWidth: '500px', width: '90%', border: '1px solid var(--border)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            {isEditing ? 'Editar Regra' : 'Nova Regra Automática'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Tipo (Identificador Único) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value.toUpperCase() })}
                                    placeholder="EX: FIRST_PURCHASE"
                                    disabled={isEditing} // Prevent changing ID/Type on edit
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: isEditing ? 'var(--muted)' : 'white' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                    Usado no código para identificar quando gerar (ex: FIRST_PURCHASE)
                                </p>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Prefixo do Código *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.codePrefix}
                                    onChange={(e) => setFormData({ ...formData, codePrefix: e.target.value.toUpperCase() })}
                                    placeholder="EX: BEMVINDO"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Tipo Desconto
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
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
                                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Validade (Dias após geração)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Ilimitado"
                                    value={formData.expirationDays}
                                    onChange={(e) => setFormData({ ...formData, expirationDays: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    />
                                    Regra Ativa
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
                                    onClick={() => setShowModal(false)}
                                    disabled={submitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Regra')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
