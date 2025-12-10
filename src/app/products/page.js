"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error('API returned non-array data:', data);
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                setProducts([]);
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
                    <p style={{ fontSize: '1.1rem', color: '#000000' }}>
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
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
