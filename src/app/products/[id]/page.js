"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
const { t, formatCurrency } = useLanguage();
const { trackView } = useAnalytics();

const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);
const [quantity, setQuantity] = useState(1);
const [adding, setAdding] = useState(false);
const [activeTab, setActiveTab] = useState('images'); // 'images' or '3d'
const hasTracked = useRef(false);

useEffect(() => {
    console.log('Fetching product with ID:', id);
    fetch(`/api/products/${id}`)
        .then(res => {
            console.log('Response status:', res.status);
            if (!res.ok) throw new Error('Product not found');
            return res.json();
        })
        .then(data => {
            console.log('Product data:', data);
            setProduct(data);
            setLoading(false);

            // Track product view only once
            if (!hasTracked.current) {
                trackView('product', data.id, data.name, data.sku);
                hasTracked.current = true;
            }
        })
        .catch(err => {
            console.error('Error loading product:', err);
            setLoading(false);
        });
}, [id]);

const handleAddToCart = () => {
    setAdding(true);
    addToCart(product, quantity);

    // Visual feedback
    setTimeout(() => {
        setAdding(false);
        alert(t('cart.added_success') || 'Produto adicionado ao carrinho!');
    }, 500);
};

if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Carregando...</div>;

if (!product) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h1>Produto não encontrado</h1>
        <a href="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Voltar para Loja
        </a>
    </div>
);

return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <Breadcrumbs items={[
            { label: 'Produtos', href: '/products' },
            ...(product.category ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }] : []),
            { label: product.name }
        ]} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Left Column: Gallery/3D Viewer */}
            <div>
                {/* Tabs - só aparecem se modelo 3D existe */}
                {product.model3D && (
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            onClick={() => setActiveTab('images')}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: activeTab === 'images' ? 'var(--primary)' : 'var(--muted)',
                                color: activeTab === 'images' ? 'white' : '#000',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                fontWeight: activeTab === 'images' ? 'bold' : 'normal',
                                transition: 'all 0.2s'
                            }}
                        >
                            🖼️ Imagens
                        </button>
                        <button
                            onClick={() => setActiveTab('3d')}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: activeTab === '3d' ? 'var(--primary)' : 'var(--muted)',
                                color: activeTab === '3d' ? 'white' : '#000',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                fontWeight: activeTab === '3d' ? 'bold' : 'normal',
                                transition: 'all 0.2s'
                            }}
                        >
                            🧊 Modelo 3D
                        </button>
                    </div>
                )}

                {/* Content - alterna entre galeria e visualizador 3D */}
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

            {/* Right Column: Details */}
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {product.name}
                </h1>

                {isAdmin && product.sku && (
                    <div style={{
                        display: 'inline-block',
                        background: '#f3f4f6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        color: '#000000',
                        marginBottom: '1rem'
                    }}>
                        SKU: {product.sku}
                    </div>
                )}

                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    {formatCurrency(product.price)}
                </div>

                <div style={{ marginBottom: '2rem', lineHeight: '1.6', color: '#000000' }}>
                    {product.description || 'Sem descrição.'}
                </div>

                {product.htmlContent && (
                    <div
                        style={{ marginBottom: '2rem', overflow: 'hidden' }}
                        dangerouslySetInnerHTML={{ __html: product.htmlContent }}
                    />
                )}

                {/* Stock Status */}
                <div style={{ marginBottom: '2rem' }}>
                    {product.stock > 0 ? (
                        <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ● Em Estoque ({product.stock} unidades)
                        </span>
                    ) : (
                        <span style={{ color: 'red', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ● Esgotado
                        </span>
                    )}
                </div>

                {/* Add to Cart Actions */}
                {product.stock > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {!product.isCustomizable && (
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >
                                    -
                                </button>
                                <span style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
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
                )}

                {/* Wishlist and Compare Buttons */}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <WishlistButton productId={product.id} />
                    <CompareButton product={product} />
                </div>

                {/* Additional Info / Categories */}
                {product.category && (
                    <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', color: '#000000', fontSize: '0.9rem' }}>
                        Categoria: <a href={`/categories/${product.category.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{product.category.name}</a>
                    </div>
                )}
            </div>
        </div>
    </div>
);
}
