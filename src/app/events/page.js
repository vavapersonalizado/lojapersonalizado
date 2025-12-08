"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { isVideo } from "@/lib/mediaUtils";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function EventsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const { trackView } = useAnalytics();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/events');
                const data = await res.json();
                setEvents(Array.isArray(data) ? data : []);

                // Track page view
                if (data.length > 0) {
                    trackView('page', 'events-page', 'Página de Eventos');
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [trackView]);

    const openModal = (mediaUrl) => {
        setSelectedMedia(mediaUrl);
    };

    const closeModal = () => {
        setSelectedMedia(null);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{
                marginBottom: '3rem',
                textAlign: 'center',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Blog de Eventos</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Fique por dentro das nossas novidades e eventos.</p>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                    {events.map(event => (
                        <article key={event.id} className="card" style={{
                            padding: '2rem',
                            border: 'none',
                            background: 'transparent',
                            boxShadow: 'none',
                            borderBottom: '1px solid var(--border)',
                            borderRadius: 0
                        }}>
                            <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                                    {event.title}
                                </h2>
                                <p style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '0.9rem' }}>
                                    📅 {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </header>

                            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--foreground)', marginBottom: '2rem' }}>
                                <p style={{ marginBottom: '1rem' }}>{event.description}</p>
                                {event.htmlContent && (
                                    <div
                                        style={{ marginTop: '1rem', overflow: 'hidden' }}
                                        dangerouslySetInnerHTML={{ __html: event.htmlContent }}
                                    />
                                )}
                            </div>

                            {event.images && event.images.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem',
                                    marginTop: '2rem'
                                }}>
                                    {event.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            style={{ position: 'relative', cursor: 'pointer', height: '200px', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}
                                            onClick={() => openModal(img)}
                                        >
                                            {isVideo(img) ? (
                                                <>
                                                    <video
                                                        src={img}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        muted
                                                    />
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        borderRadius: '50%',
                                                        width: '50px',
                                                        height: '50px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '1.5rem'
                                                    }}>
                                                        ▶
                                                    </div>
                                                </>
                                            ) : (
                                                <img
                                                    src={img}
                                                    alt={`${event.title} - ${idx + 1}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            {/* Media Modal */}
            {selectedMedia && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                    onClick={closeModal}
                >
                    <div
                        style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: -40,
                                right: 0,
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '2rem',
                                cursor: 'pointer'
                            }}
                        >
                            &times;
                        </button>
                        {isVideo(selectedMedia) ? (
                            <video
                                src={selectedMedia}
                                controls
                                autoPlay
                                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 'var(--radius)' }}
                            />
                        ) : (
                            <img
                                src={selectedMedia}
                                alt="Full view"
                                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 'var(--radius)' }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
