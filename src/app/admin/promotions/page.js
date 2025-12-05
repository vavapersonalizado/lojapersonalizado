"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/ImageUpload';

export default function AdminPromotions() {
    const { data: session } = useSession();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', discount: '' });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const res = await fetch('/api/promotions?admin=true');
            const data = await res.json();
            setPromotions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ title: '', description: '', imageUrl: '', discount: '' });
                fetchPromotions();
            }
        } catch (error) {
            console.error('Error creating promotion:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await fetch(`/api/promotions?id=${id}`, { method: 'DELETE' });
            fetchPromotions();
        } catch (error) {
            console.error('Error deleting promotion:', error);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await fetch('/api/promotions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active: !currentStatus })
            });
            fetchPromotions();
        } catch (error) {
            console.error('Error toggling promotion:', error);
        }
    };

    if (session?.user?.role !== 'admin') return <p>Acesso negado</p>;

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Gerenciar Promoções</h1>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3>Nova Promoção</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Título da Promoção"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        required
                    />
                    <textarea
                        placeholder="Descrição"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                    <input
                        type="number"
                        placeholder="Desconto (%)"
                        value={formData.discount}
                        onChange={e => setFormData({ ...formData, discount: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Imagem da Promoção</label>
                        <ImageUpload
                            onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                            currentImage={formData.imageUrl}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Adicionar Promoção</button>
                </form>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {promotions.map(promo => (
                    <div key={promo.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {promo.imageUrl && (
                                <img src={promo.imageUrl} alt={promo.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                            )}
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>{promo.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                    {promo.discount}% OFF
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={promo.active}
                                    onChange={() => toggleActive(promo.id, promo.active)}
                                />
                                Ativo
                            </label>
                            <button onClick={() => handleDelete(promo.id)} className="btn btn-outline" style={{ color: 'red', borderColor: 'red' }}>
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
