"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function RightSidebar() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const [events, setEvents] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [ads, setAds] = useState([]);

    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
    const [isPromoHovered, setIsPromoHovered] = useState(false);
    const promoIntervalRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [isAdmin]);

    const fetchData = async () => {
        try {
            const [eventsRes, promoRes, adsRes] = await Promise.all([
                fetch(`/api/events${isAdmin ? '?admin=true' : ''}`),
                fetch(`/api/promotions${isAdmin ? '?admin=true' : ''}`),
                fetch(`/api/ads${isAdmin ? '?admin=true' : ''}`)
            ]);

            const eventsData = await eventsRes.json();
            const promoData = await promoRes.json();
            const adsData = await adsRes.json();

            setEvents(Array.isArray(eventsData) ? eventsData : []);
            setPromotions(Array.isArray(promoData) ? promoData : []);
            setAds(Array.isArray(adsData) ? adsData : []);
        } catch (error) {
            console.error('Error fetching sidebar data:', error);
        }
    };

    // Promotion Carousel Logic
    useEffect(() => {
        if (promotions.length > 1 && !isPromoHovered) {
            promoIntervalRef.current = setInterval(() => {
                setCurrentPromoIndex(prev => (prev + 1) % promotions.length);
            }, 3000); // 3 seconds per slide
        }

        return () => {
            if (promoIntervalRef.current) clearInterval(promoIntervalRef.current);
        };
    }, [promotions.length, isPromoHovered]);

    const toggleItem = async (type, id, currentStatus) => {
        if (!isAdmin) return;
        try {
            await fetch(`/api/${type}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active: !currentStatus })
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error(`Error toggling ${type}:`, error);
        }
    };

    return (
        <aside className="glass" style={{
            width: '280px',
            padding: '1.5rem',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
        }}>
            {/* Promoções */}
            {promotions.length > 0 && (
                <section
                    onMouseEnter={() => setIsPromoHovered(true)}
                    onMouseLeave={() => setIsPromoHovered(false)}
                >
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        🔥 Promoções
                        {isAdmin && promotions[currentPromoIndex] && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                                {promotions[currentPromoIndex].active ? '🟢' : '🔴'}
                            </span>
                        )}
                    </h3>

                    <div style={{
                        background: 'linear-gradient(135deg, var(--secondary), #ec4899)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow)',
                        position: 'relative',
                        transition: 'all 0.3s ease'
                    }}>
                        {promotions[currentPromoIndex] && (
                            <>
                                {promotions[currentPromoIndex].imageUrl && (
                                    <img
                                        src={promotions[currentPromoIndex].imageUrl}
                                        alt={promotions[currentPromoIndex].title}
                                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}
                                    />
                                )}
                                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {promotions[currentPromoIndex].title}
                                </p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                    {promotions[currentPromoIndex].description}
                                </p>
                                {promotions[currentPromoIndex].discount && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem',
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: 'var(--radius)',
                                        display: 'inline-block'
                                    }}>
                                        {promotions[currentPromoIndex].discount}% OFF
                                    </div>
                                )}

                                {isAdmin && (
                                    <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={promotions[currentPromoIndex].active}
                                                onChange={() => toggleItem('promotions', promotions[currentPromoIndex].id, promotions[currentPromoIndex].active)}
                                            />
                                            Visível
                                        </label>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Dots Indicator */}
                        {promotions.length > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '1rem' }}>
                                {promotions.map((_, idx) => (
                                    <div key={idx} style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: idx === currentPromoIndex ? 'white' : 'rgba(255,255,255,0.4)'
                                    }} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Eventos */}
            <section>
                <h3 style={{
                    fontSize: '1.1rem',
                    marginBottom: '1rem',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    📅 Próximos Eventos
                </h3>
                <div style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    padding: '1rem',
                    borderRadius: 'var(--radius)'
                }}>
                    {events.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Nenhum evento próximo.</p>
                    ) : (
                        events.map((event, index) => (
                            <div key={event.id}>
                                <div style={{ marginBottom: '0.5rem', opacity: event.active ? 1 : 0.5 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{event.title}</p>
                                        {isAdmin && (
                                            <input
                                                type="checkbox"
                                                checked={event.active}
                                                onChange={() => toggleItem('events', event.id, event.active)}
                                                title="Visível"
                                            />
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                        {new Date(event.date).toLocaleDateString()}
                                    </p>
                                </div>
                                {index < events.length - 1 && (
                                    <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }}></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Propagandas */}
            {ads.map(ad => (
                <section key={ad.id} style={{ flex: 1, opacity: ad.active ? 1 : 0.5 }}>
                    <div style={{ position: 'relative' }}>
                        {ad.link ? (
                            <a href={ad.link} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.title}
                                    style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                />
                            </a>
                        ) : (
                            <img
                                src={ad.imageUrl}
                                alt={ad.title}
                                style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                            />
                        )}

                        {isAdmin && (
                            <div style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: 'rgba(255,255,255,0.9)',
                                padding: '2px',
                                borderRadius: '4px'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={ad.active}
                                    onChange={() => toggleItem('ads', ad.id, ad.active)}
                                    title="Visível"
                                />
                            </div>
                        )}
                    </div>
                </section>
            ))}
        </aside>
    );
}
