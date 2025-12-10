"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function WishlistPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { addToCart } = useCart();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated') {
            fetchWishlist();
        }
    }, [status, router]);

    const fetchWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist');
            if (res.ok) {
                const data = await res.json();
                setWishlist(data);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const res = await fetch(`/api/wishlist?productId=${productId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setWishlist(wishlist.filter(item => item.productId !== productId));
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                ❤️ Minha Lista de Desejos
            </h1>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f9f9f9', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
                        Sua lista de desejos está vazia
                    </p>
                    <button
                        onClick={() => router.push('/products')}
                        className="btn btn-primary"
                    >
                        Explorar Produtos
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {wishlist.map((item) => (
                        <div
                            key={item.id}
                            className="card"
                            style={{ overflow: 'hidden', position: 'relative' }}
                        >
                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromWishlist(item.productId)}
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '2rem',
                                    height: '2rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    zIndex: 10,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title="Remover da lista"
                            >
                                ×
                            </button>

                            {/* Product Image */}
                            <div
                                onClick={() => router.push(`/products/${item.productId}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                {item.product.images && item.product.images.length > 0 ? (
                                    <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '200px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: '#999' }}>Sem imagem</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div style={{ padding: '1rem' }}>
                                <h3
                                    onClick={() => router.push(`/products/${item.productId}`)}
                                    style={{ fontWeight: 'bold', marginBottom: '0.5rem', cursor: 'pointer' }}
                                >
                                    {item.product.name}
                                </h3>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    {item.product.category?.name}
                                </p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem' }}>
                                    R$ {item.product.price.toFixed(2)}
                                </p>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleAddToCart(item.product)}
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        🛒 Adicionar
                                    </button>
                                    <button
                                        onClick={() => router.push(`/products/${item.productId}`)}
                                        className="btn btn-outline"
                                        style={{ flex: 1 }}
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
