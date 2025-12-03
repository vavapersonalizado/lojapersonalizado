"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';

export default function Home() {
    const { data: session } = useSession();
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Hero */}
            <section style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(to bottom, var(--secondary), var(--background))',
                borderRadius: 'var(--radius)'
            }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Produtos Exclusivos</h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Encontre o que você precisa com a melhor qualidade.</p>
            </section>

            {/* Product Grid */}
            <main className="container" style={{ padding: '2rem 1rem', flex: 1 }}>
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Carregando produtos...</p>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Nenhum produto cadastrado ainda.</p>
                        {session && (
                            <Link href="/admin/products/new" className="btn btn-primary">
                                Cadastrar Primeiro Produto
                            </Link>
                        )}
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
                                    background: product.images?.[0] ? `url(${product.images[0]}) center/cover` : 'var(--muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {!product.images?.[0] && <span style={{ fontSize: '2rem' }}>📦</span>}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        ¥ {product.price.toFixed(0)}
                                    </p>
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                        Adicionar ao Carrinho
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                &copy; 2025 Loja Personalizada. Todos os direitos reservados.
            </footer>
        </div>
    );
}
