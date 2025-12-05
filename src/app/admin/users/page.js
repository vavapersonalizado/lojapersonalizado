"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = () => {
        fetch('/api/users')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch users');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error('Data is not an array:', data);
                    setUsers([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setUsers([]);
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

        fetchUsers();
    }, [session, status, router]);

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            notes: user.notes || '',
            role: user.role || 'client',
            classification: user.classification || '',
            deserveDiscount: user.deserveDiscount || false,
            discountType: user.discountType || 'percentage',
            discountValue: user.discountValue || 0
        });
        setShowModal(true);
    };

    const handleCreateClick = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            notes: '',
            role: 'client',
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
            const url = editingUser
                ? `/api/users/${editingUser.id}`
                : '/api/users/register'; // Note: Register might need updates too if it handles these fields, but usually register is basic. PUT handles updates.

            const method = editingUser ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save user');
            }

            // Success - refresh users list and close modal
            fetchUsers();
            setShowModal(false);
            setFormData({ name: '', email: '', phone: '', notes: '' });
            setEditingUser(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p style={{ padding: '2rem' }}>Carregando usuários...</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Gerenciar Clientes</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleCreateClick}
                >
                    ➕ Cadastrar Cliente
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
                            <th style={{ padding: '1rem' }}>Nome</th>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>Classificação</th>
                            <th style={{ padding: '1rem' }}>Desconto</th>
                            <th style={{ padding: '1rem' }}>Função</th>
                            <th style={{ padding: '1rem' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name}
                                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                        />
                                    ) : (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {user.name?.[0] || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <div>{user.name || 'Sem nome'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{user.phone}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>{user.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    {user.classification ? (
                                        <span style={{
                                            background: '#e0f2fe',
                                            color: '#0369a1',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {user.classification}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {user.deserveDiscount ? (
                                        <span style={{ color: 'green', fontWeight: 'bold' }}>
                                            {user.discountType === 'fixed' ? '¥' : ''}
                                            {user.discountValue}
                                            {user.discountType === 'percentage' ? '%' : ''}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        background: user.role === 'admin' ? 'var(--primary)' : 'var(--secondary)',
                                        color: user.role === 'admin' ? 'var(--primary-foreground)' : 'var(--secondary-foreground)'
                                    }}>
                                        {user.role === 'admin' ? 'Admin' : 'Cliente'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                                        onClick={() => handleEditClick(user)}
                                    >
                                        ✏️ Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Registration/Edit Modal */}
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
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: '1px solid var(--border)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            {editingUser ? 'Editar Cliente' : 'Cadastrar Cliente'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        disabled={!!editingUser} // Disable email edit for existing users
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', opacity: editingUser ? 0.7 : 1 }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Função
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    >
                                        <option value="client">Cliente</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid var(--border)' }} />

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Classificação e Descontos</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Classificação
                                    </label>
                                    <select
                                        value={formData.classification}
                                        onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    >
                                        <option value="">Padrão</option>
                                        <option value="VIP">VIP</option>
                                        <option value="Family">Família</option>
                                        <option value="Friend">Amigo</option>
                                        <option value="Partner">Parceiro</option>
                                        <option value="Loyal">Fiel</option>
                                        <option value="Good">Bom</option>
                                        <option value="Medium">Médio</option>
                                        <option value="Bad">Ruim</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.deserveDiscount}
                                            onChange={(e) => setFormData({ ...formData, deserveDiscount: e.target.checked })}
                                        />
                                        Elegível para Desconto
                                    </label>

                                    {formData.deserveDiscount && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Tipo</label>
                                                <select
                                                    value={formData.discountType}
                                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                                >
                                                    <option value="percentage">Porcentagem (%)</option>
                                                    <option value="fixed">Valor Fixo (¥)</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Valor</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                                    value={formData.discountValue}
                                                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Observações Internas
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', resize: 'vertical' }}
                                />
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
                                        setFormData({ name: '', email: '', phone: '', notes: '' });
                                        setError('');
                                        setEditingUser(null);
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
                                    {submitting ? 'Salvando...' : (editingUser ? 'Salvar Alterações' : 'Cadastrar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
