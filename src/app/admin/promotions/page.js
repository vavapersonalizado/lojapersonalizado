"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/ImageUpload';

export default function AdminPromotions() {
    const { data: session } = useSession();
    const [promotions, setPromotions] = useState([]);
    const [formData, setFormData] = useState({ id: null, title: '', description: '', images: [], discount: '', htmlContent: '' });
    const [isEditing, setIsEditing] = useState(false);

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
            const method = isEditing ? 'PATCH' : 'POST';
            const res = await fetch('/api/promotions', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ id: null, title: '', description: '', images: [], discount: '', htmlContent: '' });
                setIsEditing(false);
                fetchPromotions();
            }
        } catch (error) {
            console.error('Error saving promotion:', error);
        }
    };

    const handleEdit = (promo) => {
        setFormData({
            id: promo.id,
            title: promo.title,
            description: promo.description || '',
            images: promo.images || [],
            discount: promo.discount || '',
            htmlContent: promo.htmlContent || ''
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setFormData({ id: null, title: '', description: '', images: [], discount: '', htmlContent: '' });
        setIsEditing(false);
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

    const handleImageUpload = (urlOrUrls) => {
        const newUrls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newUrls]
        }));
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    if (session?.user?.role !== 'admin') return <p>Acesso negado</p>;

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Gerenciar Promoções</h1>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{isEditing ? 'Editar Promoção' : 'Nova Promoção'}</h3>
                    {isEditing && (
                        <button onClick={cancelEdit} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                            Cancelar Edição
                        </button>
                    )}
                </div>
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
                    <textarea
                        placeholder="Código HTML para Banner (Embed/Iframe)"
                        value={formData.htmlContent}
                        onChange={e => setFormData({ ...formData, htmlContent: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '80px' }}
                    />

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Imagens da Promoção</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {formData.images.map((img, index) => (
                                <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                    <img src={img} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        style={{
                                            position: 'absolute',
                                            top: -5,
                                            right: -5,
                                            background: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px'
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                        <ImageUpload
                            onUpload={handleImageUpload}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        {isEditing ? 'Salvar Alterações' : 'Adicionar Promoção'}
                    </button>
                </form>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {promotions.map(promo => (
                    <div key={promo.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {promo.images && promo.images.length > 0 ? (
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {promo.images.slice(0, 3).map((img, idx) => (
                                        <img key={idx} src={img} alt={promo.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                    ))}
                                    {promo.images.length > 3 && (
                                        <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--muted)', borderRadius: 'var(--radius)', fontSize: '0.8rem' }}>
                                            +{promo.images.length - 3}
                                        </div>
                                    )}
                                </div>
                            ) : promo.imageUrl && (
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
                            <button
                                onClick={() => handleEdit(promo)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.9rem', padding: '0.25rem 0.5rem' }}
                            >
                                ✏️ Editar
                            </button>
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
