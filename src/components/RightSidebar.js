"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
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

    // Ad Carousel State
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [isAdHovered, setIsAdHovered] = useState(false);
    const adIntervalRef = useRef(null);

    // Ad Carousel Logic
    useEffect(() => {
        if (ads.length > 1 && !isAdHovered) {
            adIntervalRef.current = setInterval(() => {
                setCurrentAdIndex(prev => (prev + 1) % ads.length);
            }, 5000); // Slower rotation for ads
        }
        return () => {
            if (adIntervalRef.current) clearInterval(adIntervalRef.current);
        };
    }, [ads.length, isAdHovered]);

    const [selectedMedia, setSelectedMedia] = useState(null);

    // Internal Slideshow State (for cycling images within a single item)
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const internalIntervalRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const [eventsRes, promoRes, adsRes] = await Promise.all([
                fetch(`/api/events${isAdmin ? '?admin=true' : ''}`, { cache: 'no-store' }),
                fetch(`/api/promotions${isAdmin ? '?admin=true' : ''}`, { cache: 'no-store' }),
                fetch(`/api/announcements${isAdmin ? '?admin=true' : ''}`, { cache: 'no-store' })
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
    }, [isAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    // Internal Slideshow Logic (cycles images of the CURRENT item)
    useEffect(() => {
        internalIntervalRef.current = setInterval(() => {
            setActiveImageIndex(prev => prev + 1);
        }, 2000); // Cycle images every 2 seconds

        return () => {
            if (internalIntervalRef.current) clearInterval(internalIntervalRef.current);
        };
    }, []);

    const getActiveMedia = (item) => {
        if (!item) return null;
        if (item.images && item.images.length > 0) {
            return item.images[activeImageIndex % item.images.length];
        }
        return item.imageUrl || null;
    };

    const toggleItem = async (type, id, currentStatus) => {
        if (!isAdmin) return;
        try {
            const endpoint = type === 'ads' ? 'announcements' : type;
            await fetch(`/api/${endpoint}`, {
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

    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            <aside className="glass" style={{
                width: isCollapsed ? '70px' : '280px',
                padding: isCollapsed ? '1rem 0.5rem' : '1.5rem',
                height: '100vh',
                position: 'sticky',
                top: 0,
                overflowY: 'auto',
                borderLeft: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                transition: 'width 0.3s ease',
                background: 'var(--card)'
            }}>
                <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius)',
                            color: 'var(--muted-foreground)',
                            fontSize: '1.2rem'
                        }}
                    >
                        {isCollapsed ? '⬅️' : '➡️'}
                    </button>
                </div>
                {/* Promoções */}
                {promotions.length > 0 && (
                    <section
                        onMouseEnter={() => setIsPromoHovered(true)}
                        onMouseLeave={() => setIsPromoHovered(false)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'stretch' }}
                    >
                        {isCollapsed ? (
                            <div title="Promoções" style={{ fontSize: '1.5rem', cursor: 'pointer' }}>🔥</div>
                        ) : (
                            <>
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
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
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
                                                getActiveMedia(promotions[currentPromoIndex]) && (
                                                    <div
                                                        style={{ position: 'relative', marginBottom: '0.5rem', cursor: 'pointer' }}
                                                        onClick={() => openModal(getActiveMedia(promotions[currentPromoIndex]))}
                                                    >
                                                        {isVideo(getActiveMedia(promotions[currentPromoIndex])) ? (
                                                            <video
                                                                src={getActiveMedia(promotions[currentPromoIndex])}
                                                                style={{ width: '100%', borderRadius: 'var(--radius)' }}
                                                                muted
                                                                autoPlay
                                                                loop
                                                            />
                                                        ) : (
                                                            <Image
                                                                src={getActiveMedia(promotions[currentPromoIndex])}
                                                                alt={promotions[currentPromoIndex].title}
                                                                width={0}
                                                                height={0}
                                                                sizes="100vw"
                                                                style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }}
                                                            />
                                                        )}
                                                        {promotions[currentPromoIndex].images && promotions[currentPromoIndex].images.length > 1 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: '5px',
                                                                right: '5px',
                                                                background: 'rgba(0,0,0,0.6)',
                                                                color: 'white',
                                                                padding: '2px 6px',
                                                                borderRadius: '10px',
                                                                fontSize: '0.7rem'
                                                            }}>
                                                                {promotions[currentPromoIndex].images.length} fotos
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                                {promotions[currentPromoIndex].title}
                                            </p>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                opacity: 0.9,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {promotions[currentPromoIndex].description}
                                            </p>
                                            {promotions[currentPromoIndex].discount && (
                                                <div style={{
                                                    marginTop: '0.5rem',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.2rem',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: 'var(--radius)',
                                                    display: 'inline-block'
                                                }}>
                                                    {promotions[currentPromoIndex].discount}% OFF
                                                </div>
                                            )}

                                            {isAdmin && (
                                                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
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
                                                    background: idx === currentPromoIndex ? 'var(--primary)' : 'var(--muted)'
                                                }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                    </section>
                )}

                {/* Eventos */}
                <section
                    onMouseEnter={() => setIsEventHovered(true)}
                    onMouseLeave={() => setIsEventHovered(false)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'stretch' }}
                >
                    {isCollapsed ? (
                        <div title="Eventos" style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📅</div>
                    ) : (
                        <>
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
                                boxShadow: 'var(--shadow)',
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
                                                        getActiveMedia(events[currentEventIndex]) && (
                                                            <div
                                                                style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer' }}
                                                                onClick={() => openModal(getActiveMedia(events[currentEventIndex]))}
                                                            >
                                                                {isVideo(getActiveMedia(events[currentEventIndex])) ? (
                                                                    <video
                                                                        src={getActiveMedia(events[currentEventIndex])}
                                                                        style={{ width: '100%', height: 'auto' }}
                                                                        muted
                                                                        autoPlay
                                                                        loop
                                                                    />
                                                                ) : (
                                                                    <Image
                                                                        src={getActiveMedia(events[currentEventIndex])}
                                                                        alt={events[currentEventIndex].title}
                                                                        width={0}
                                                                        height={0}
                                                                        sizes="100vw"
                                                                        style={{ width: '100%', height: 'auto' }}
                                                                    />
                                                                )}
                                                                {events[currentEventIndex].images && events[currentEventIndex].images.length > 1 && (
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        bottom: '5px',
                                                                        right: '5px',
                                                                        background: 'rgba(0,0,0,0.6)',
                                                                        color: 'white',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '10px',
                                                                        fontSize: '0.7rem'
                                                                    }}>
                                                                        {events[currentEventIndex].images.length} fotos
                                                                    </div>
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
                        </>
                    )}
                </section>

                {/* Publicidade */}
                {ads.length > 0 && (
                    <section
                        onMouseEnter={() => setIsAdHovered(true)}
                        onMouseLeave={() => setIsAdHovered(false)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'stretch' }}
                    >
                        {isCollapsed ? (
                            <div title="Publicidade" style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📢</div>
                        ) : (
                            <>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '1rem',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    📢 Publicidade
                                    {isAdmin && ads[currentAdIndex] && (
                                        <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                                            {ads[currentAdIndex].active ? '🟢' : '🔴'}
                                        </span>
                                    )}
                                </h3>

                                <div style={{
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius)',
                                    boxShadow: 'var(--shadow)',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {ads[currentAdIndex] && (
                                        <div key={ads[currentAdIndex].id} className="fade-in">
                                            <div style={{ position: 'relative', opacity: ads[currentAdIndex].active ? 1 : 0.5 }}>
                                                {ads[currentAdIndex].htmlContent ? (
                                                    <div
                                                        style={{ marginBottom: '0.5rem', overflow: 'hidden', borderRadius: 'var(--radius)' }}
                                                        dangerouslySetInnerHTML={{ __html: ads[currentAdIndex].htmlContent }}
                                                    />
                                                ) : (
                                                    getDisplayMedia(ads[currentAdIndex]) && (
                                                        <div
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => ads[currentAdIndex].link ? window.open(ads[currentAdIndex].link, '_blank') : openModal(getDisplayMedia(ads[currentAdIndex]))}
                                                        >
                                                            {isVideo(getDisplayMedia(ads[currentAdIndex])) ? (
                                                                <video
                                                                    src={getDisplayMedia(ads[currentAdIndex])}
                                                                    style={{ width: '100%', borderRadius: 'var(--radius)', height: 'auto' }}
                                                                    muted
                                                                    autoPlay
                                                                    loop
                                                                />
                                                            ) : (
                                                                <Image
                                                                    src={getDisplayMedia(ads[currentAdIndex])}
                                                                    alt={ads[currentAdIndex].title}
                                                                    width={0}
                                                                    height={0}
                                                                    sizes="100vw"
                                                                    style={{ width: '100%', borderRadius: 'var(--radius)', height: 'auto' }}
                                                                />
                                                            )}
                                                        </div>
                                                    )
                                                )}

                                                {isAdmin && (
                                                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={ads[currentAdIndex].active}
                                                                onChange={() => toggleItem('ads', ads[currentAdIndex].id, ads[currentAdIndex].active)}
                                                                title="Visível"
                                                            />
                                                            Visível
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {ads.length > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '1rem' }}>
                                            {ads.map((_, idx) => (
                                                <div key={idx} style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: idx === currentAdIndex ? 'var(--primary)' : 'var(--muted)'
                                                }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                )}
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
                            <Image
                                src={selectedMedia}
                                alt="Full view"
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 'var(--radius)', width: 'auto', height: 'auto' }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
