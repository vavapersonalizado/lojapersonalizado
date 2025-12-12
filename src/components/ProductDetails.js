"use client";

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductGallery from '@/components/ProductGallery';
import Model3DViewer from '@/components/Model3DViewer';
import WishlistButton from '@/components/WishlistButton';
import CompareButton from '@/components/CompareButton';
import { useEffect } from 'react';

export default function ProductDetails({ product }) {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const { addToCart } = useCart();
    const { t, formatCurrency } = useLanguage();
    const { trackView } = useAnalytics();

    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('images'); // 'images' or '3d'
    const hasTracked = useRef(false);

    useEffect(() => {
        if (!hasTracked.current) {
            trackView('product', product.id, product.name, product.sku);
            hasTracked.current = true;
        }
    }, [product]);

    const handleAddToCart = () => {
        setAdding(true);
        addToCart(product, quantity);

        // Visual feedback
        setTimeout(() => {
            setAdding(false);
            alert(t('cart.added_success') || 'Produto adicionado ao carrinho!');
        }, 500);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <Breadcrumbs items={[
                { label: 'Produtos', href: '/products' },
                ...(product.category ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }] : []),
                { label: product.name }
            ]} />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '3rem',
                alignItems: 'start',
                marginTop: '2rem'
            }}>
                {/* Left Column: Gallery/3D Viewer */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    {/* Tabs - só aparecem se modelo 3D existe */}
                    {product.model3D && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button
                                onClick={() => setActiveTab('images')}
                                className={activeTab === 'images' ? 'btn btn-primary' : 'btn btn-outline'}
                                style={{ flex: 1, padding: '0.5rem' }}
                            >
                                🖼️ Imagens
                            </button>
                            <button
                                onClick={() => setActiveTab('3d')}
                                className={activeTab === '3d' ? 'btn btn-primary' : 'btn btn-outline'}
                                style={{ flex: 1, padding: '0.5rem' }}
                            >
                                🧊 Modelo 3D
                            </button>
                        </div>
                    )}

                    {/* Content - alterna entre galeria e visualizador 3D */}
                    <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                        {activeTab === 'images' ? (
                            <ProductGallery images={product.images} />
                        ) : (
                            <Model3DViewer
                                modelUrl={product.model3D}
                                modelType={product.modelType}
                                autoRotate={true}
                                showControls={true}
                                fallbackImage={product.images[0]}
                                height="500px"
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: '1.2'
                    }}>
                        {product.name}
                    </h1>

                    {isAdmin && product.sku && (
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            color: 'var(--muted-foreground)',
                            marginBottom: '1.5rem',
                            border: '1px solid var(--border)'
                        }}>
                            SKU: {product.sku}
                        </div>
                    )}

                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: 'var(--foreground)',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        {formatCurrency(product.price)}
                    </div>

                    <div style={{ marginBottom: '2rem', lineHeight: '1.8', color: 'var(--muted-foreground)', fontSize: '1.05rem' }}>
                        {product.description || 'Sem descrição.'}
                    </div>

                    {product.htmlContent && (
                        <div
                            style={{ marginBottom: '2rem', overflow: 'hidden', color: 'var(--foreground)' }}
                            dangerouslySetInnerHTML={{ __html: product.htmlContent }}
                        />
                    )}

                    {/* Stock Status */}
                    <div style={{ marginBottom: '2rem' }}>
                        {product.stock > 0 ? (
                            <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></span>
                                Em Estoque ({product.stock} unidades)
                            </span>
                        ) : (
                            <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 10px #EF4444' }}></span>
                                Esgotado
                            </span>
                        )}
                    </div>

                    {/* Add to Cart Actions */}
                    {product.stock > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
                                {!product.isCustomizable && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        background: 'rgba(255,255,255,0.05)'
                                    }}>
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={{ padding: '0 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)', fontSize: '1.2rem' }}
                                        >
                                            -
                                        </button>
                                        <span style={{ padding: '0.75rem 0', fontWeight: 'bold', minWidth: '30px', textAlign: 'center', color: 'var(--foreground)' }}>{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            style={{ padding: '0 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)', fontSize: '1.2rem' }}
                                        >
                                            +
                                        </button>
                                    </div>
                                )}

                                {product.isCustomizable ? (
                                    <a
                                        href={`/products/custom/${product.id}`}
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', textAlign: 'center', textDecoration: 'none' }}
                                    >
                                        🎨 Personalizar Agora
                                    </a>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={adding}
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
                                    >
                                        {adding ? 'Adicionando...' : t('common.add_to_cart') || 'Adicionar ao Carrinho'}
                                    </button>
                                )}
                            </div>

                            {/* Wishlist and Compare Buttons */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <WishlistButton productId={product.id} />
                                <CompareButton product={product} />
                            </div>
                        </div>
                    )}

                    {/* Additional Info / Categories */}
                    {product.category && (
                        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                            Categoria: <a href={`/categories/${product.category.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', marginLeft: '0.5rem' }}>{product.category.name}</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
