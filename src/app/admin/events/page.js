"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/ImageUpload';

export default function AdminEvents() {
    const { data: session } = useSession();
    // router removed
    const [events, setEvents] = useState([]);
    // loading removed
    const [formData, setFormData] = useState({ title: '', date: '', description: '', imageUrl: '' });

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
        } finally {
            // loading removed
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
                setFormData({ title: '', date: '', description: '', imageUrl: '' });
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Imagem do Evento (Opcional)</label>
                        <ImageUpload
                            onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                            currentImage={formData.imageUrl}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Adicionar Evento</button>
                </form>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {events.map(event => (
                    <div key={event.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {event.imageUrl && (
                                <img src={event.imageUrl} alt={event.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                            )}
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>{event.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                                    {new Date(event.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
