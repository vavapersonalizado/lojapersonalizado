"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCart } from '@/contexts/CartContext';
import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const ModelViewer = dynamic(() => import('./ModelViewer'), { ssr: false });

export default function ProductCard({ product, isClientMode }) {
    const { data: session } = useSession();
    const router = useRouter();
    const { formatCurrency } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Defensive check
    if (!product || !product.id) return null;

    const isAdmin = session?.user?.role === 'admin';

    // Helper to get the main media (3D model or first image)
    const getMainMedia = () => {
        if (!product.images || product.images.length === 0) return null;

        // Check for 3D model first
        const model3d = product.images.find(img =>
            (typeof img === 'string' && (img.endsWith('.glb') || img.endsWith('.gltf'))) ||
            (typeof img === 'object' && (img.url.endsWith('.glb') || img.url.endsWith('.gltf')))
        );

        if (model3d) {
            const url = typeof model3d === 'string' ? model3d : model3d.url;
            return { type: '3d', url };
        }

        // Fallback to first image
        const firstImage = product.images[0];
        const url = typeof firstImage === 'string' ? firstImage : firstImage.url;
        return { type: 'image', url };
    };

    // Carousel Logic
    const handleMouseEnter = () => {
        setIsHovered(true);
        if (product.images && product.images.length > 1) {
            // Start cycling images
            const interval = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % product.images.length);
            }, 1000);
            // Store interval id to clear later
            setCurrentImageIndex.interval = interval;
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setCurrentImageIndex(0); // Reset to first image
        if (setCurrentImageIndex.interval) {
            clearInterval(setCurrentImageIndex.interval);
        }
    };

    const currentMedia = product.images && product.images.length > 0
        ? product.images[currentImageIndex]
        : null;

    const mediaUrl = typeof currentMedia === 'string' ? currentMedia : currentMedia?.url;
    const is3D = mediaUrl?.endsWith('.glb') || mediaUrl?.endsWith('.gltf');

    return (
        <div
            className="card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateY(-5px)' : 'none',
                boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow)'
            }}
        >
            <div style={{ position: 'relative' }}>
                <div style={{
                    height: '220px',
                    position: 'relative',
                    background: 'var(--muted)',
                    borderRadius: 'var(--radius) var(--radius) 0 0',
                    overflow: 'hidden'
                }}>
                    {is3D ? (
                        <div style={{ width: '100%', height: '100%' }}>
                            <ModelViewer
                                src={mediaUrl}
                                alt={product.name}
                                style={{ backgroundColor: '#f5f5f5' }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                pointerEvents: 'none'
                            }}>
                                🧊 3D
                            </div>
                        </div>
                    ) : (
                        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%', height: '100%' }}>
                            {mediaUrl ? (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: `url(${mediaUrl}) center/cover`,
                                    transition: 'background-image 0.3s ease'
                                }} />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem'
                                }}>
                                    📦
                                </div>
                            )}
                        </Link>
                    )}

                    {/* Carousel Indicator */}
                    {product.images && product.images.length > 1 && isHovered && (
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '4px'
                        }}>
                            {product.images.map((_, idx) => (
                                <div key={idx} style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: idx === currentImageIndex ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Admin Controls Overlay - Outside Link */}
                {isAdmin && !isClientMode && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        zIndex: 10,
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <VisibilityToggle product={product} />
                        <button
                            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                            className="btn btn-primary"
                            style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}
                        >
                            ✏️ Editar
                        </button>
                    </div>
                )}
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>{product.name}</h3>
                </Link>

                {product.description && (
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--muted-foreground)',
                        marginBottom: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.4'
                    }}>
                        {product.description}
                    </p>
                )}

                <div style={{ marginTop: 'auto' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                        {formatCurrency(product.price)}
                    </p>
                    {product.category && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                            {product.category.name}
                        </p>
                    )}
                    <AddToCartButton product={product} />
                </div>
            </div>
        </div>
    );
}

function AddToCartButton({ product }) {
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (product.stock === 0) {
        return (
            <button
                className="btn btn-outline"
                disabled
                style={{ width: '100%', opacity: 0.5 }}
            >
                {t('common.unavailable')}
            </button>
        );
    }

    return (
        <button
            className="btn btn-primary"
            onClick={handleAddToCart}
            style={{ width: '100%' }}
        >
            {added ? `✓ ${t('common.added')}` : `🛒 ${t('common.add_to_cart')}`}
        </button>
    );
}

function VisibilityToggle({ product }) {
    const [visible, setVisible] = useState(product.visible !== false);
    const [updating, setUpdating] = useState(false);

    const handleToggle = async (e) => {
        e.stopPropagation(); // Prevent card click
        setUpdating(true);

        try {
            const response = await fetch(`/api/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visible: !visible })
            });

            if (response.ok) {
                setVisible(!visible);
            } else {
                alert('Erro ao atualizar visibilidade');
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
            alert('Erro ao atualizar visibilidade');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <input
            type="checkbox"
            checked={visible}
            onChange={handleToggle}
            disabled={updating}
            style={{
                width: '20px',
                height: '20px',
                cursor: updating ? 'wait' : 'pointer',
                accentColor: 'var(--primary)',
                opacity: updating ? 0.5 : 1
            }}
            title={`Visível para clientes: ${visible ? 'Sim' : 'Não'}`}
        />
    );
}
