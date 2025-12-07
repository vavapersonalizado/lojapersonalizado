"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        postalCode: '',
        prefecture: '',
        city: '',
        town: '',
        street: '',
        building: '',
        contactPreference: []
    });

    const [cities, setCities] = useState([]);
    const [prefectures, setPrefectures] = useState([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated') {
            fetchUserData();
            fetchPrefectures();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, router]);

    const fetchPrefectures = () => {
        fetch('/api/address/cities')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPrefectures(data);
            })
            .catch(console.error);
    };

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

    const fetchUserData = async () => {
        try {
            // We can use the session ID to fetch the user's specific data
            // But we need an endpoint that returns "me" or allows fetching by ID for self.
            // The /api/users/[id] is PUT only? No, usually GET too or we need one.
            // Wait, /api/users is admin only list.
            // We need a way to get "my" data.
            // Usually /api/auth/session has some, but not all fields.
            // Let's assume we can fetch from /api/users/${session.user.id} if we add GET support there or create /api/users/me.
            // Since I didn't create GET in [id]/route.js, I should probably add it or use a new route.
            // For now, let's try to fetch from a new endpoint /api/users/me or add GET to [id].
            // I'll assume I need to add GET to [id] as well.
            // But for this step, I'll write the fetch logic assuming the endpoint exists/works.
            // I'll update [id]/route.js to include GET in the next step if needed.
            // Actually, I can just render what I have in session for now, but session is stale.
            // I'll add GET to [id]/route.js in the next turn.

            const res = await fetch(`/api/users/${session.user.id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    postalCode: data.postalCode || '',
                    prefecture: data.prefecture || '',
                    city: data.city || '',
                    town: data.town || '',
                    street: data.street || '',
                    building: data.building || '',
                    contactPreference: data.contactPreference || []
                });
                if (data.prefecture) fetchCities(data.prefecture);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
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

            setFormData(prev => ({
                ...prev,
                prefecture: data.prefecture,
                city: data.city,
                town: data.town
            }));

            fetchCities(data.prefecture);

        } catch (error) {
            console.error('Zip search error:', error);
            alert('Erro ao buscar endereço');
        }
    };

    const handlePrefectureChange = (e) => {
        const pref = e.target.value;
        setFormData({ ...formData, prefecture: pref, city: '' });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`/api/users/${session.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setSuccess('Perfil atualizado com sucesso!');
            // Update session if needed? NextAuth session is JWT, so it won't update immediately unless we trigger update.
            // But for UI persistence, the DB is updated.
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando perfil...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Meu Perfil</h1>

            <div style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '2rem'
            }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            Dados Pessoais
                        </h3>
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
                                    Email
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    value={formData.email}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', opacity: 0.7, background: 'var(--muted)' }}
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
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            Endereço (Japão)
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                CEP (Postal Code) - Auto Preenchimento
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
                                    Número da Casa
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
                                Edifício - Apartamento
                            </label>
                            <input
                                type="text"
                                value={formData.building}
                                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ padding: '0.75rem', background: '#e6fffa', color: '#047857', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {success}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                        >
                            {submitting ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
