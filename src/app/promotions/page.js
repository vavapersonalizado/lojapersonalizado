"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { isVideo } from "@/lib/mediaUtils";

export default function PromotionsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        fetch('/api/promotions')
            .then(res => res.json())
            .then(data => {
                setPromotions(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setPromotions([]);
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
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Blog de Promoções</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Aproveite nossas ofertas exclusivas.</p>
                {isAdmin && (
                    <div style={{ marginTop: '1rem' }}>
                        <Link href="/admin/promotions" className="btn btn-primary">
                            ⚙️ Gerenciar Promoções
                        </Link>
                    </div>
                )}
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : promotions.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)' }}>
                        Nenhuma promoção ativa no momento.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                    {promotions.map(promo => (
                        <article key={promo.id} className="card" style={{
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
                                    {promo.title}
                                </h2>
                                {promo.discount > 0 && (
                                    <span style={{
                                        background: 'var(--primary)',
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius)',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        display: 'inline-block',
                                        marginTop: '0.5rem'
                                    }}>
                                        {promo.discount}% OFF
                                    </span>
                                )}
                            </header>

                            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--foreground)', marginBottom: '2rem' }}>
                                <p style={{ marginBottom: '1rem' }}>{promo.description}</p>
                                {promo.htmlContent && (
                                    <div
                                        style={{ marginTop: '1rem', overflow: 'hidden' }}
                                        dangerouslySetInnerHTML={{ __html: promo.htmlContent }}
                                    />
                                )}
                            </div>

                            {/* Images Grid */}
                            {(promo.images && promo.images.length > 0) || promo.imageUrl ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem',
                                    marginTop: '2rem',
                                    marginBottom: '2rem'
                                }}>
                                    {promo.images && promo.images.length > 0 ? (
                                        promo.images.map((img, idx) => (
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
                                                        alt={`${promo.title} - ${idx + 1}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    />
                                                )}
                                            </div>
                                        ))
                                    ) : promo.imageUrl && (
                                        <div
                                            style={{ position: 'relative', cursor: 'pointer', height: '300px', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}
                                            onClick={() => openModal(promo.imageUrl)}
                                        >
                                            <img
                                                src={promo.imageUrl}
                                                alt={promo.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            <div style={{ textAlign: 'center' }}>
                                <Link href="/products" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                                    Ver Produtos Relacionados
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Media Modal */}
            {
                selectedMedia && (
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
                )
            }
        </div>
    );
}
