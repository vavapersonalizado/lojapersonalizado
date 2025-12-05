"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/ImageUpload';

export default function AdminEvents() {
    const { data: session } = useSession();
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({ title: '', date: '', description: '', images: [] });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events?admin=true');
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ title: '', date: '', description: '', images: [] });
                fetchEvents();
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await fetch('/api/events', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active: !currentStatus })
            });
            fetchEvents();
        } catch (error) {
            console.error('Error toggling event:', error);
        }
    };

    const handleImageUpload = (url) => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, url]
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
                <h3>Novo Evento</h3>
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
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Imagens do Evento</label>
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
                    <button type="submit" className="btn btn-primary">Adicionar Evento</button>
                </form>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {events.map(event => (
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
                                <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
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
