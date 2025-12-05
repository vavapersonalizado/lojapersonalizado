"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function EventsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/events');
                const data = await res.json();
                setEvents(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Eventos</h1>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : events.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)' }}>
                        {isAdmin
                            ? 'Nenhum evento cadastrado. Clique em "Adicionar Evento" para começar.'
                            : 'Nenhum evento disponível no momento.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {events.map(event => (
                        <div key={event.id} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{event.title}</h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: '500', marginBottom: '1rem' }}>
                                        📅 {new Date(event.date).toLocaleDateString()}
                                    </p>
                                    <p style={{ color: 'var(--muted-foreground)' }}>{event.description}</p>
                                </div>
                                {event.images && event.images.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                                        {event.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`${event.title} - ${idx + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--radius)',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => window.open(img, '_blank')}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
