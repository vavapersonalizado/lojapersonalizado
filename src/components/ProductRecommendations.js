"use client";

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function ProductRecommendations({
    productId = null,
    type = 'similar',
    title = 'Você também pode gostar',
    limit = 4
}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [productId, type]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                type,
                limit: limit.toString(),
                ...(productId && { productId })
            });

            const res = await fetch(`/api/products/recommendations?${params}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{title}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} style={{ height: '350px', background: '#f0f0f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.8; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
