"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { isVideo } from "@/lib/mediaUtils";

export default function AdsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        fetch('/api/ads')
            .then(res => res.json())
            .then(data => {
                setAds(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setAds([]);
                setLoading(false);
            });
    }, []);

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
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Blog de Anúncios</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Confira nossos parceiros e novidades.</p>
                {isAdmin && (
                    <div style={{ marginTop: '1rem' }}>
                        <Link href="/admin/ads" className="btn btn-primary">
                            ⚙️ Gerenciar Anúncios
                        </Link>
                    </div>
                )}
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : ads.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)' }}>
                        Nenhum anúncio ativo no momento.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                    {ads.map(ad => (
                        <article key={ad.id} className="card" style={{
                            padding: '2rem',
                            border: 'none',
                            background: 'transparent',
                            boxShadow: 'none',
                            borderBottom: '1px solid var(--border)',
                            borderRadius: 0,
                            overflow: 'visible'
                        }}>
                            <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                                    {ad.title}
                                </h2>
                            </header>

                            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--foreground)', marginBottom: '2rem' }}>
                                {ad.htmlContent && (
                                    <div
                                        style={{ marginTop: '1rem', overflow: 'hidden' }}
                                        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
                                    />
                                )}
                            </div>

                            {/* Images Grid */}
                            {(ad.images && ad.images.length > 0) || ad.imageUrl ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem',
                                    marginTop: '2rem',
                                    marginBottom: '2rem'
                                }}>
                                    {ad.images && ad.images.length > 0 ? (
                                        ad.images.map((img, idx) => (
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
                                                        alt={`${ad.title} - ${idx + 1}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    />
                                                )}
                                            </div>
                                        ))
                                    ) : ad.imageUrl && (
                                        <div
                                            style={{ position: 'relative', cursor: 'pointer', height: '300px', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}
                                            onClick={() => openModal(ad.imageUrl)}
                                        >
                                            <img
                                                src={ad.imageUrl}
                                                alt={ad.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {ad.link && (
                                <div style={{ textAlign: 'center' }}>
                                    <a
                                        href={ad.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                                    >
                                        Visitar Site
                                    </a>
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
