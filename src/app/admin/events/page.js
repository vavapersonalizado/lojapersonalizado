"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/ImageUpload';
import { isVideo } from '@/lib/mediaUtils';

export default function AdminEvents() {
    const { data: session } = useSession();
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({ id: null, title: '', date: '', description: '', images: [], htmlContent: '' });
    const [isEditing, setIsEditing] = useState(false);

    const [sortBy, setSortBy] = useState('date'); // 'title', 'date', 'createdAt'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/events?admin=true');
                const data = await res.json();
                setEvents(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        fetchEvents();
    }, []);

    const sortData = (data) => {
        return [...data].sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (sortBy === 'date' || sortBy === 'createdAt') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const sortedEvents = sortData(events);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = isEditing ? 'PATCH' : 'POST';
            const res = await fetch('/api/events', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ id: null, title: '', date: '', description: '', images: [], htmlContent: '', carouselDuration: 8, autoRotate: true });
                setIsEditing(false);
                const fetchRes = await fetch('/api/events?admin=true');
                const fetchData = await fetchRes.json();
                setEvents(Array.isArray(fetchData) ? fetchData : []);
            }
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await fetch('/api/events', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active: !currentStatus })
            });
            const fetchRes = await fetch('/api/events?admin=true');
            const fetchData = await fetchRes.json();
            setEvents(Array.isArray(fetchData) ? fetchData : []);
        } catch (error) {
            console.error('Error toggling event:', error);
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
            <h1 style={{ marginBottom: '2rem' }}>Gerenciar Eventos</h1>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{isEditing ? 'Editar Evento' : 'Novo Evento'}</h3>
                    {isEditing && (
                        <button onClick={cancelEdit} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                            Cancelar Edição
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Título do Evento"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        required
                    />
                    <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        required
                    />
                    <textarea
                        placeholder="Descrição"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                    <textarea
                        placeholder="Código HTML para Banner (Embed/Iframe)"
                        value={formData.htmlContent}
                        onChange={e => setFormData({ ...formData, htmlContent: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '80px' }}
                    />
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Imagens do Evento</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {formData.images.map((img, index) => (
                                <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                    {isVideo(img) ? (
                                        <video
                                            src={img}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
                                            muted
                                        />
                                    ) : (
                                        <img src={img} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                    )}
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
                                            fontSize: '12px',
                                            zIndex: 10
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
                        {isEditing ? 'Salvar Alterações' : 'Adicionar Evento'}
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
                    <option value="date">Data do Evento</option>
                    <option value="title">Título</option>
                    <option value="createdAt">Data de Criação</option>
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
                {sortedEvents.map(event => (
                    <div key={event.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {event.images && event.images.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {event.images.slice(0, 3).map((img, idx) => (
                                        <img key={idx} src={img} alt={event.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                    ))}
                                    {event.images.length > 3 && (
                                        <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--muted)', borderRadius: 'var(--radius)', fontSize: '0.8rem' }}>
                                            +{event.images.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>{event.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: '#000000' }}>
                                    {new Date(event.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={event.active}
                                    onChange={() => toggleActive(event.id, event.active)}
                                />
                                Ativo
                            </label>
                            <button
                                onClick={() => handleEdit(event)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.9rem', padding: '0.25rem 0.5rem' }}
                            >
                                ✏️ Editar
                            </button>
                            <button onClick={() => handleDelete(event.id)} className="btn btn-outline" style={{ color: 'red', borderColor: 'red' }}>
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
