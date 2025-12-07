"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { isVideo } from '@/lib/mediaUtils';

export default function RightSidebar() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const [events, setEvents] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [ads, setAds] = useState([]);

    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
    const [isPromoHovered, setIsPromoHovered] = useState(false);
    const promoIntervalRef = useRef(null);

    // Event Carousel State
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [isEventHovered, setIsEventHovered] = useState(false);
    const eventIntervalRef = useRef(null);

    const [selectedMedia, setSelectedMedia] = useState(null);

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

    useEffect(() => {
        fetchData();
    }, [isAdmin]);

    // Promotion Carousel Logic
    useEffect(() => {
        if (promotions.length > 1 && !isPromoHovered) {
            promoIntervalRef.current = setInterval(() => {
                setCurrentPromoIndex(prev => (prev + 1) % promotions.length);
            }, 3000);
        }
        return () => {
            if (promoIntervalRef.current) clearInterval(promoIntervalRef.current);
        };
    }, [promotions.length, isPromoHovered]);

    // Event Carousel Logic
    useEffect(() => {
        if (events.length > 1 && !isEventHovered) {
            eventIntervalRef.current = setInterval(() => {
                setCurrentEventIndex(prev => (prev + 1) % events.length);
            }, 4000); // Slightly slower than promotions
        }
        return () => {
            if (eventIntervalRef.current) clearInterval(eventIntervalRef.current);
        };
    }, [events.length, isEventHovered]);

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

    const getDisplayMedia = (item) => {
        if (item.images && item.images.length > 0) return item.images[0];
        if (item.imageUrl) return item.imageUrl;
        return null;
    };

    const openModal = (mediaUrl) => {
        if (mediaUrl) setSelectedMedia(mediaUrl);
    };

    const closeModal = () => {
        setSelectedMedia(null);
    };

    return (
        <>
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
                                    {promotions[currentPromoIndex].htmlContent ? (
                                        <div
                                            style={{ marginBottom: '0.5rem', overflow: 'hidden', borderRadius: 'var(--radius)' }}
                                            dangerouslySetInnerHTML={{ __html: promotions[currentPromoIndex].htmlContent }}
                                        />
                                    ) : (
                                        getDisplayMedia(promotions[currentPromoIndex]) && (
                                            <div
                                                style={{ position: 'relative', height: '120px', marginBottom: '0.5rem', cursor: 'pointer' }}
                                                onClick={() => openModal(getDisplayMedia(promotions[currentPromoIndex]))}
                                            >
                                                {isVideo(getDisplayMedia(promotions[currentPromoIndex])) ? (
                                                    <video
                                                        src={getDisplayMedia(promotions[currentPromoIndex])}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
                                                        muted
                                                    />
                                                ) : (
                                                    <img
                                                        src={getDisplayMedia(promotions[currentPromoIndex])}
                                                        alt={promotions[currentPromoIndex].title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
                                                    />
                                                )}
                                            </div>
                                        )
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
                <section
                    onMouseEnter={() => setIsEventHovered(true)}
                    onMouseLeave={() => setIsEventHovered(false)}
                >
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
                        borderRadius: 'var(--radius)',
                        minHeight: '150px'
                    }}>
                        {events.length === 0 ? (
                            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Nenhum evento próximo.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {events[currentEventIndex] && (
                                    <div key={events[currentEventIndex].id} className="fade-in">
                                        <div style={{ marginBottom: '0.5rem', opacity: events[currentEventIndex].active ? 1 : 0.5 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{events[currentEventIndex].title}</p>
                                                {isAdmin && (
                                                    <input
                                                        type="checkbox"
                                                        checked={events[currentEventIndex].active}
                                                        onChange={() => toggleItem('events', events[currentEventIndex].id, events[currentEventIndex].active)}
                                                        title="Visível"
                                                    />
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                                {new Date(events[currentEventIndex].date).toLocaleDateString()}
                                            </p>

                                            {/* Event Image/Video Preview or HTML Content */}
                                            {events[currentEventIndex].htmlContent ? (
                                                <div
                                                    style={{ marginBottom: '0.5rem', overflow: 'hidden', borderRadius: 'var(--radius)' }}
                                                    dangerouslySetInnerHTML={{ __html: events[currentEventIndex].htmlContent }}
                                                />
                                            ) : (
                                                getDisplayMedia(events[currentEventIndex]) && (
                                                    <div
                                                        style={{ position: 'relative', height: '120px', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer' }}
                                                        onClick={() => openModal(getDisplayMedia(events[currentEventIndex]))}
                                                    >
                                                        {isVideo(getDisplayMedia(events[currentEventIndex])) ? (
                                                            <video
                                                                src={getDisplayMedia(events[currentEventIndex])}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                muted
                                                            />
                                                        ) : (
                                                            <img
                                                                src={getDisplayMedia(events[currentEventIndex])}
                                                                alt={events[currentEventIndex].title}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Dots Indicator for Events */}
                                {events.length > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '0.5rem' }}>
                                        {events.map((_, idx) => (
                                            <div key={idx} style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: idx === currentEventIndex ? 'var(--primary)' : 'var(--muted)'
                                            }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Propagandas */}
                {ads.map(ad => (
                    <section key={ad.id} style={{ flex: 1, opacity: ad.active ? 1 : 0.5 }}>
                        <div style={{ position: 'relative' }}>
                            {ad.htmlContent ? (
                                <div
                                    style={{ marginBottom: '0.5rem', overflow: 'hidden', borderRadius: 'var(--radius)' }}
                                    dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
                                />
                            ) : (
                                getDisplayMedia(ad) && (
                                    <div
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => ad.link ? window.open(ad.link, '_blank') : openModal(getDisplayMedia(ad))}
                                    >
                                        {isVideo(getDisplayMedia(ad)) ? (
                                            <video
                                                src={getDisplayMedia(ad)}
                                                style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                                muted
                                                autoPlay
                                                loop
                                            />
                                        ) : (
                                            <img
                                                src={getDisplayMedia(ad)}
                                                alt={ad.title}
                                                style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                            />
                                        )}
                                    </div>
                                )
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
                        zIndex: 9999,
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
        </>
    );
}
