"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CategoryPage() {
    const params = useParams();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch category info
        fetch('/api/categories')
            .then(res => res.json())
            .then(categories => {
                const cat = categories.find(c => c.slug === params.slug);
                setCategory(cat);

                // Fetch products for this category
                if (cat) {
                    return fetch('/api/products');
                }
            })
            .then(res => res?.json())
            .then(allProducts => {
                if (allProducts && category) {
                    const filtered = allProducts.filter(p => p.categoryId === category.id);
                    setProducts(filtered);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [params.slug, category?.id]);

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (!category) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Categoria não encontrada</h1>
                <Link href="/products" className="btn btn-primary">
                    Ver todos os produtos
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{category.name}</h1>
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                        {products.length} {products.length === 1 ? 'produto' : 'produtos'}
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/admin/products/new" className="btn btn-primary">
                        ➕ Adicionar Produto
                    </Link>
                )}
            </div>

            {products.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>EM BREVE</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
                        {isAdmin
                            ? `Nenhum produto na categoria "${category.name}". Adicione produtos para começar.`
                            : `Produtos em "${category.name}" em breve!`}
                    </p>
                    <Link href="/products" className="btn btn-outline">
                        Ver todos os produtos
                    </Link>
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
                                background: product.images?.[0]?.url
                                    ? `url(${product.images[0].url}) center/cover`
                                    : product.images?.[0]
                                        ? `url(${product.images[0]}) center/cover`
                                        : 'var(--muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius) var(--radius) 0 0'
                            }}>
                                {(!product.images?.[0]?.url && !product.images?.[0]) && <span style={{ fontSize: '2rem' }}>📦</span>}
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                                <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
                                    ¥ {product.price.toFixed(0)}
                                </p>
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
