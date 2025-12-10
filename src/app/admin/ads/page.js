"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/ImageUpload';

export default function AdminAds() {
    const { data: session } = useSession();
    const [ads, setAds] = useState([]);
    const [formData, setFormData] = useState({ id: null, title: '', images: [], link: '', htmlContent: '', expiresAt: '' });
    const [isEditing, setIsEditing] = useState(false);

    const [sortBy, setSortBy] = useState('createdAt'); // 'title', 'createdAt', 'expiresAt'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/announcements?admin=true', { cache: 'no-store' });
            const data = await res.json();
            setAds(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching ads:', error);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const sortData = (data) => {
        return [...data].sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (sortBy === 'createdAt' || sortBy === 'expiresAt') {
                valA = valA ? new Date(valA).getTime() : 0;
                valB = valB ? new Date(valB).getTime() : 0;
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const sortedAds = sortData(ads);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = isEditing ? 'PATCH' : 'POST';
            const res = await fetch('/api/announcements', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ id: null, title: '', images: [], link: '', htmlContent: '', expiresAt: '' });
                setIsEditing(false);
                fetchAds();
            }
        } catch (error) {
            console.error('Error saving ad:', error);
        }
    };

    const handleEdit = (ad) => {
        setFormData({
            id: ad.id,
            title: ad.title,
            images: ad.images || [],
            link: ad.link || '',
            htmlContent: ad.htmlContent || '',
            expiresAt: ad.expiresAt ? new Date(ad.expiresAt).toISOString().split('T')[0] : ''
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setFormData({ id: null, title: '', images: [], link: '', htmlContent: '', expiresAt: '' });
        setIsEditing(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta propaganda?')) return;
        try {
            console.log('Deleting ad:', id);
            const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                console.error('Failed to delete:', data);
                alert(`Erro ao excluir: ${data.error || 'Erro desconhecido'}`);
                return;
            }

            console.log('Ad deleted successfully');
            await fetchAds();
            alert('Propaganda excluída com sucesso!');
        } catch (error) {
            console.error('Error deleting ad:', error);
            alert('Erro ao excluir propaganda. Verifique o console.');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await fetch('/api/announcements', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active: !currentStatus })
            });
            fetchAds();
        } catch (error) {
            console.error('Error toggling ad:', error);
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
            <h1 style={{ marginBottom: '2rem' }}>Gerenciar Propagandas</h1>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{isEditing ? 'Editar Propaganda' : 'Nova Propaganda'}</h3>
                    {isEditing && (
                        <button onClick={cancelEdit} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                            Cancelar Edição
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Título (Interno)"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        required
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Link de Destino (Opcional)"
                            value={formData.link}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', flex: 1 }}
                        />
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem', color: '#000000' }}>Validade (Opcional)</label>
                            <input
                                type="date"
                                value={formData.expiresAt}
                                onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: '100%' }}
                            />
                        </div>
                    </div>
                    <textarea
                        placeholder="Código HTML para Banner (Embed/Iframe)"
                        value={formData.htmlContent}
                        onChange={e => setFormData({ ...formData, htmlContent: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '80px' }}
                    />

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Imagens da Propaganda</label>
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
                        {isEditing ? 'Salvar Alterações' : 'Adicionar Propaganda'}
                    </button>
                </form>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Ordenar por:</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                >
                    <option value="createdAt">Data de Criação</option>
                    <option value="title">Título</option>
                </select>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                >
                    <option value="asc">Crescente (A-Z / Antigo-Novo)</option>
                    <option value="desc">Decrescente (Z-A / Novo-Antigo)</option>
                </select>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {sortedAds.map(ad => (
                    <div key={ad.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {ad.images && ad.images.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {ad.images.slice(0, 3).map((img, idx) => (
                                        <img key={idx} src={img} alt={ad.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                    ))}
                                    {ad.images.length > 3 && (
                                        <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--muted)', borderRadius: 'var(--radius)', fontSize: '0.8rem' }}>
                                            +{ad.images.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>{ad.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: '#000000' }}>
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
                            <button
                                onClick={() => handleEdit(ad)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.9rem', padding: '0.25rem 0.5rem' }}
                            >
                                ✏️ Editar
                            </button>
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
