"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';

export default function ProductsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Todos os Produtos</h1>
                {isAdmin && (
                    <Link href="/admin/products/new" className="btn btn-primary">
                        ➕ Adicionar Produto
                    </Link>
                )}
            </div>

            {loading ? (
                <p>Carregando produtos...</p>
            ) : products.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>EM BREVE</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)' }}>
                        {isAdmin
                            ? 'Nenhum produto cadastrado. Clique em "Adicionar Produto" para começar.'
                            : 'Novos produtos em breve!'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {products.map(product => (
                        <div key={product.id} className="card">
                            <div style={{
                                height: '200px',
                                background: product.images?.[0]?.url ? `url(${product.images[0].url}) center/cover` : 'var(--muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius) var(--radius) 0 0'
                            }}>
                                {!product.images?.[0]?.url && <span style={{ fontSize: '2rem' }}>📦</span>}
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
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
                    ))}
                </div>
            )}
        </div>
    );
}
