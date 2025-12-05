"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/ImageUpload';

export default function AdminAds() {
    const { data: session } = useSession();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', imageUrl: '', link: '' });

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/ads?admin=true');
            const data = await res.json();
            setAds(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ title: '', imageUrl: '', link: '' });
                fetchAds();
            }
        } catch (error) {
            console.error('Error creating ad:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await fetch(`/api/ads?id=${id}`, { method: 'DELETE' });
            fetchAds();
        } catch (error) {
            console.error('Error deleting ad:', error);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await fetch('/api/ads', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active: !currentStatus })
            });
            fetchAds();
        } catch (error) {
            console.error('Error toggling ad:', error);
        }
    };

    if (session?.user?.role !== 'admin') return <p>Acesso negado</p>;

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Gerenciar Propagandas</h1>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3>Nova Propaganda</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Título (Interno)"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Link de Destino (Opcional)"
                        value={formData.link}
                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Imagem da Propaganda</label>
                        <ImageUpload
                            onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                            currentImage={formData.imageUrl}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Adicionar Propaganda</button>
                </form>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {ads.map(ad => (
                    <div key={ad.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {ad.imageUrl && (
                                <img src={ad.imageUrl} alt={ad.title} style={{ width: '100px', height: 'auto', borderRadius: 'var(--radius)' }} />
                            )}
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>{ad.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                    {ad.link || 'Sem link'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={ad.active}
                                    onChange={() => toggleActive(ad.id, ad.active)}
                                />
                                Ativo
                            </label>
                            <button onClick={() => handleDelete(ad.id)} className="btn btn-outline" style={{ color: 'red', borderColor: 'red' }}>
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
