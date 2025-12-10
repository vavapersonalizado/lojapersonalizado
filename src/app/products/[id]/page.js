"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductGallery from '@/components/ProductGallery';
import Model3DViewer from '@/components/Model3DViewer';

export default function ProductPage() {
    const params = useParams();
    const { id } = params;
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const { addToCart } = useCart();
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
    }, [id]); // Removed trackView from dependencies

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
        </h1>

                    {
        isAdmin && product.sku && (
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
        )
    }

                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                        {formatCurrency(product.price)}
                    </div>

                    <div style={{ marginBottom: '2rem', lineHeight: '1.6', color: '#000000' }}>
                        {product.description || 'Sem descrição.'}
                    </div>

    {
        product.htmlContent && (
            <div
                style={{ marginBottom: '2rem', overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: product.htmlContent }}
            />
        )
    }

    {/* Stock Status */ }
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

    {/* Add to Cart Actions */ }
    {
        product.stock > 0 && (
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
        )
    }

    {/* Additional Info / Categories */ }
    {
        product.category && (
            <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', color: '#000000', fontSize: '0.9rem' }}>
                Categoria: <a href={`/categories/${product.category.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{product.category.name}</a>
            </div>
        )
    }
                </div >
            </div >
        </div >
    );
}
