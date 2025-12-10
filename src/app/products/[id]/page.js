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
import WishlistButton from '@/components/WishlistButton';

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
                autoRotate = { true}
                            showControls = { true}
                            fallbackImage = { product.images[0] }
                            height = "500px"
                />
                    )}
        </div>

                {/* Right Column: Details */ }
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

    </div>
        </div >
    );
}
