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
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [adding, setAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('images'); // 'images' or '3d'
    const hasTracked = useRef(false);

    // Variant Logic
    const hasVariants = product.variants && product.variants.length > 0;

    // Get unique sizes from variants
    const variantSizes = hasVariants
        ? [...new Set(product.variants.map(v => v.size))]
        : [];

    // Get available colors based on selected size
    const availableColors = (hasVariants && selectedSize)
        ? product.variants.filter(v => v.size === selectedSize && v.quantity > 0).map(v => v.color)
        : [];

    // Get current stock based on selection
    const currentVariant = (hasVariants && selectedSize && selectedColor)
        ? product.variants.find(v => v.size === selectedSize && v.color === selectedColor)
        : null;

    const currentStock = hasVariants
        ? (currentVariant ? currentVariant.quantity : (selectedSize && selectedColor ? 0 : null)) // null means "select options to see stock"
        : product.stock;

    useEffect(() => {
        if (!hasTracked.current) {
            trackView('product', product.id, product.name, product.sku);
            hasTracked.current = true;
        }
    }, [product]);

    // Reset selections when product changes
    useEffect(() => {
        setSelectedSize(null);
        setSelectedColor(null);
        setQuantity(1);
    }, [product.id]);

    const handleAddToCart = () => {
        setAdding(true);

        // Validate Size (Legacy)
        if (!hasVariants && product.sizes && product.sizes.some(s => s.active) && !selectedSize) {
            alert('Por favor, selecione um tamanho.');
            setAdding(false);
            return;
        }

        // Validate Variants
        if (hasVariants) {
            if (!selectedSize) {
                alert('Por favor, selecione um tamanho.');
                setAdding(false);
                return;
            }
            if (!selectedColor) {
                alert('Por favor, selecione uma cor.');
                setAdding(false);
                return;
            }
            if (currentStock < quantity) {
                alert(`Estoque insuficiente. Apenas ${currentStock} unidades disponíveis.`);
                setAdding(false);
                return;
            }
        }

        addToCart(product, quantity, {
            size: selectedSize,
            color: selectedColor,
            variantId: currentVariant ? `${selectedSize}-${selectedColor}` : null
        });

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
                        {hasVariants ? (
                            selectedSize && selectedColor ? (
                                currentStock > 0 ? (
                                    <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></span>
                                        Em Estoque ({currentStock} unidades)
                                    </span>
                                ) : (
                                    <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 10px #EF4444' }}></span>
                                        Esgotado nesta combinação
                                    </span>
                                )
                            ) : (
                                <span style={{ color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ℹ️ Selecione tamanho e cor para ver o estoque
                                </span>
                            )
                        ) : (
                            product.stock === null || product.stock > 0 ? (
                                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></span>
                                    {product.stock === null ? 'Em Estoque (Ilimitado)' : `Em Estoque (${product.stock} unidades)`}
                                </span>
                            ) : (
                                <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 10px #EF4444' }}></span>
                                    Esgotado
                                </span>
                            )
                        )}
                    </div>

                    {/* Variant Selectors */}
                    {hasVariants ? (
                        <>
                            {/* Size Selector */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tamanho:</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {variantSizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => {
                                                setSelectedSize(size);
                                                setSelectedColor(null); // Reset color when size changes
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '4px',
                                                border: selectedSize === size ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                background: selectedSize === size ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                                                color: selectedSize === size ? 'var(--primary)' : 'var(--foreground)',
                                                cursor: 'pointer',
                                                fontWeight: selectedSize === size ? 'bold' : 'normal',
                                                minWidth: '40px'
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selector */}
                            {selectedSize && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Cor:</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {availableColors.length > 0 ? (
                                            availableColors.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '4px',
                                                        border: selectedColor === color ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                        background: selectedColor === color ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                                                        color: selectedColor === color ? 'var(--primary)' : 'var(--foreground)',
                                                        cursor: 'pointer',
                                                        fontWeight: selectedColor === color ? 'bold' : 'normal'
                                                    }}
                                                >
                                                    {color}
                                                </button>
                                            ))
                                        ) : (
                                            <span style={{ color: '#EF4444', fontSize: '0.9rem' }}>Sem cores disponíveis para este tamanho.</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Legacy Size Selector */
                        product.sizes && product.sizes.some(s => s.active) && (
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tamanho:</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {product.sizes.filter(s => s.active).map(size => (
                                        <button
                                            key={size.name}
                                            onClick={() => setSelectedSize(size.name)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '4px',
                                                border: selectedSize === size.name ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                background: selectedSize === size.name ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                                                color: selectedSize === size.name ? 'var(--primary)' : 'var(--foreground)',
                                                cursor: 'pointer',
                                                fontWeight: selectedSize === size.name ? 'bold' : 'normal',
                                                minWidth: '40px'
                                            }}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                                {!selectedSize && adding && (
                                    <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                        Por favor, selecione um tamanho.
                                    </p>
                                )}
                            </div>
                        )
                    )}

                    {/* Attributes List */}
                    {product.attributes && product.attributes.some(a => a.active) && (
                        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Especificações</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                                {product.attributes.filter(a => a.active).map((attr, index) => (
                                    <div key={index} style={{ display: 'contents' }}>
                                        <span style={{ color: 'var(--muted-foreground)' }}>{attr.name}:</span>
                                        <span style={{ fontWeight: '500' }}>{attr.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Actions */}
                    {(product.stock === null || product.stock > 0) && (
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
                                            onClick={() => setQuantity(product.stock === null ? quantity + 1 : Math.min(product.stock, quantity + 1))}
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
