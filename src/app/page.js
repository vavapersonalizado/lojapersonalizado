"use client";

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <header style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--background)'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Loja Personalizada</h1>
                <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {session ? (
                        <>
                            <Link href="/admin/products" className="btn btn-outline">Admin</Link>
                            <button onClick={() => signOut()} className="btn btn-outline">Sair</button>
                        </>
                    ) : (
                        <button onClick={() => signIn('google')} className="btn btn-primary">Entrar</button>
                    )}
                </nav>
            </header>

            {/* Hero */}
            <section style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(to bottom, var(--secondary), var(--background))'
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
                                    background: product.image ? `url(${product.image}) center/cover` : 'var(--muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {!product.image && <span style={{ fontSize: '2rem' }}>📦</span>}
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
