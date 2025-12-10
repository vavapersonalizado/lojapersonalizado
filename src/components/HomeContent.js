"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import OnlineCounter from '@/components/OnlineCounter';

export default function HomeContent() {
    const { data: session } = useSession();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(res => {
                if (!res.ok) throw new Error('Erro ao buscar produtos');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error('Formato de dados inválido:', data);
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro:', err);
                setProducts([]);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Hero */}
            <section style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius)',
                color: 'white',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{
                        fontSize: '1.5rem',
                        marginBottom: '0',
                        opacity: 0.9,
                        fontFamily: 'Outfit, sans-serif'
                    }}>
                        Encontre os melhores personalizados com a melhor qualidade.
                    </p>

                    {/* Online Counter */}
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <OnlineCounter />
                    </div>
                </div>

                {/* Decorative Circles */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '-50px',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-50px',
                    right: '-50px',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)'
                }} />
            </section>

            {/* Product Grid */}
            <main className="container" style={{ padding: '2rem 1rem', flex: 1 }}>
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Carregando produtos...</p>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Nenhum produto cadastrado ainda.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                        gap: '1rem'
                    }}>
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} isClientMode={true} />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: '#000000' }}>
                &copy; 2025 Loja Personalizada. Todos os direitos reservados. (v1.1)
            </footer>
        </div>
    );
}
