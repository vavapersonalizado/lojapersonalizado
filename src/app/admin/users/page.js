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

    // Search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [classificationFilter, setClassificationFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name-asc'); // name-asc, name-desc, date-desc, date-asc

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

    const [cities, setCities] = useState([]);
    const [prefectures, setPrefectures] = useState([]);

    useEffect(() => {
        // Fetch prefectures on mount
        fetch('/api/address/cities')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPrefectures(data);
            })
            .catch(console.error);
    }, []);

    const fetchCities = (pref) => {
        if (!pref) {
            setCities([]);
            return;
        }
        fetch(`/api/address/cities?prefecture=${pref}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCities(data);
            })
            .catch(console.error);
    };

    const handleZipSearch = async () => {
        if (!formData.postalCode || formData.postalCode.length < 7) {
            alert('Digite um CEP válido (7 dígitos)');
            return;
        }

        try {
            const res = await fetch(`/api/address/lookup?zip=${formData.postalCode}`);
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Endereço não encontrado');
                return;
            }

            // Update form data
            setFormData(prev => ({
                ...prev,
                prefecture: data.prefecture,
                city: data.city,
                town: data.town,
                // Keep street/building if they typed something? Maybe overwrite.
            }));

            // Fetch cities for the new prefecture so the dropdown is correct
            fetchCities(data.prefecture);

        } catch (error) {
            console.error('Zip search error:', error);
            alert('Erro ao buscar endereço');
        }
    };

    const handlePrefectureChange = (e) => {
        const pref = e.target.value;
        setFormData({ ...formData, prefecture: pref, city: '' }); // Reset city
        fetchCities(pref);
    };

    const handleContactPreferenceChange = (type) => {
        const current = formData.contactPreference || [];
        let updated;
        if (current.includes(type)) {
            updated = current.filter(t => t !== type);
        } else {
            updated = [...current, type];
        }
        setFormData({ ...formData, contactPreference: updated });
    };

    const [viewingUser, setViewingUser] = useState(null);

    const handleViewClick = (user) => {
        setViewingUser(user);
    };

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
            discountValue: user.discountValue || 0,
            postalCode: user.postalCode || '',
            prefecture: user.prefecture || '',
            city: user.city || '',
            town: user.town || '',
            street: user.street || '',
            building: user.building || '',
            contactPreference: user.contactPreference || []
        });
        if (user.prefecture) fetchCities(user.prefecture);
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
            discountValue: 0,
            postalCode: '',
            prefecture: '',
            city: '',
            town: '',
            street: '',
            building: '',
            contactPreference: []
        });
        setCities([]);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const url = editingUser
                ? `/api/users/${editingUser.id}`
                : '/api/users/register';

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
            setFormData({ name: '', email: '', phone: '', notes: '' }); // Reset basic
            setEditingUser(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter, search and sort users
    const filteredUsers = users
        .filter(user => {
            // Classification filter
            if (classificationFilter !== 'all' && user.classification !== classificationFilter) {
                return false;
            }

            // Search filter
            if (searchTerm.trim()) {
                const search = searchTerm.toLowerCase();
                return (
                    user.name?.toLowerCase().includes(search) ||
                    user.email?.toLowerCase().includes(search) ||
                    user.phone?.toLowerCase().includes(search) ||
                    user.postalCode?.toLowerCase().includes(search)
                );
            }

            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '');
                case 'date-desc':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'date-asc':
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                default:
                    return 0;
            }
        });

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

            {/* Search and Filters */}
            <div style={{
                background: 'var(--card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Search Bar */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                            🔍 Buscar
                        </label>
                        <input
                            type="text"
                            placeholder="Nome, email, telefone ou CEP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Classification Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                            🏷️ Classificação
                        </label>
                        <select
                            value={classificationFilter}
                            onChange={(e) => setClassificationFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="all">Todas</option>
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

                    {/* Sort By */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                            🔄 Ordenar por
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="name-asc">Nome (A-Z)</option>
                            <option value="name-desc">Nome (Z-A)</option>
                            <option value="date-desc">Cadastro (mais recente)</option>
                            <option value="date-asc">Cadastro (mais antigo)</option>
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {filteredUsers.length} cliente(s) encontrado(s)
                    {searchTerm && ` para "${searchTerm}"`}
                </div>
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
                            <th style={{ padding: '1rem' }}>Localização (CEP)</th>
                            <th style={{ padding: '1rem' }}>Classificação</th>
                            <th style={{ padding: '1rem' }}>Função</th>
                            <th style={{ padding: '1rem' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                        onClick={() => handleViewClick(user)}
                                    >
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
                                        <div style={{ fontWeight: '500', textDecoration: 'underline', textDecorationColor: '#000000', textUnderlineOffset: '4px' }}>
                                            {user.name || 'Sem nome'}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {user.email}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {user.postalCode || '-'}
                                </td>
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

            {/* View User Modal (Read Only) */}
            {viewingUser && (
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Detalhes do Cliente</h2>
                            <button
                                onClick={() => setViewingUser(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {viewingUser.image ? (
                                    <img src={viewingUser.image} alt={viewingUser.name} style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                                ) : (
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {viewingUser.name?.[0] || '?'}
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{viewingUser.name}</div>
                                    <div style={{ color: '#000000' }}>{viewingUser.email}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Telefone</label>
                                    <div>{viewingUser.phone || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Pref. Contato</label>
                                    <div>{viewingUser.contactPreference?.join(', ') || '-'}</div>
                                </div>
                            </div>

                            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Endereço</label>
                                <div>
                                    {viewingUser.postalCode && `〒${viewingUser.postalCode}`}<br />
                                    {viewingUser.prefecture} {viewingUser.city}<br />
                                    {viewingUser.town} {viewingUser.street}<br />
                                    {viewingUser.building}
                                </div>
                            </div>

                            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Classificação</label>
                                    <div>{viewingUser.classification || 'Padrão'}</div>
                                </div>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Função</label>
                                    <div>{viewingUser.role === 'admin' ? 'Administrador' : 'Cliente'}</div>
                                </div>
                            </div>

                            {viewingUser.deserveDiscount && (
                                <div style={{ background: '#f0fdf4', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                                    <span style={{ color: '#000000', fontWeight: 'bold' }}>✓ Elegível para Desconto</span>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        {viewingUser.discountType === 'percentage' ? `${viewingUser.discountValue}%` : `¥${viewingUser.discountValue}`}
                                    </div>
                                </div>
                            )}

                            {viewingUser.notes && (
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Observações</label>
                                    <div style={{ background: 'var(--muted)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                                        {viewingUser.notes}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setViewingUser(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        maxWidth: '800px',
                        width: '95%',
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
                                        disabled={!!editingUser}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', opacity: editingUser ? 0.7 : 1 }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Telefone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Preferência de Contato
                                    </label>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.contactPreference?.includes('Line')}
                                                onChange={() => handleContactPreferenceChange('Line')}
                                            />
                                            LINE
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.contactPreference?.includes('WhatsApp')}
                                                onChange={() => handleContactPreferenceChange('WhatsApp')}
                                            />
                                            WhatsApp
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid var(--border)' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Endereço (Japão)</h3>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    CEP (Postal Code)
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="123-4567"
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        style={{ width: '150px', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleZipSearch}
                                    >
                                        🔍 Buscar
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Província (Prefecture)
                                    </label>
                                    <select
                                        value={formData.prefecture}
                                        onChange={handlePrefectureChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    >
                                        <option value="">Selecione...</option>
                                        {prefectures.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Cidade (City)
                                    </label>
                                    <select
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                        disabled={!formData.prefecture}
                                    >
                                        <option value="">Selecione...</option>
                                        {cities.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Bairro (Town)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.town}
                                        onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Rua
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Casa / Edifício - Apartamento
                                </label>
                                <input
                                    type="text"
                                    value={formData.building}
                                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
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
