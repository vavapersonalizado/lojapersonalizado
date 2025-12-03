"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('./ModelViewer'), { ssr: false });

export default function ProductCard({ product }) {
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

    const media = getMainMedia();

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
                height: '250px',
                position: 'relative',
                background: 'var(--muted)',
                borderRadius: 'var(--radius) var(--radius) 0 0',
                overflow: 'hidden'
            }}>
                {media ? (
                    media.type === '3d' ? (
                        <div style={{ width: '100%', height: '100%' }}>
                            <ModelViewer
                                src={media.url}
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
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: `url(${media.url}) center/cover`
                        }} />
                    )
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
            </div>

            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>{product.name}</h3>

                <div style={{ marginTop: 'auto' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                        ¥ {product.price.toFixed(0)}
                    </p>
                    {product.category && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                            {product.category.name}
                        </p>
                    )}
                    <button className="btn btn-primary" style={{ width: '100%' }}>
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    );
}
