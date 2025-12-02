"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminProductsPage() {
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

    if (loading) return <div>Carregando...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Produtos</h1>
                <Link href="/admin/products/new" className="btn btn-primary">
                    + Novo Produto
                </Link>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '1rem' }}>Nome</th>
                        <th style={{ padding: '1rem' }}>Preço</th>
                        <th style={{ padding: '1rem' }}>Categoria</th>
                        <th style={{ padding: '1rem' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem' }}>{product.name}</td>
                            <td style={{ padding: '1rem' }}>R$ {product.price.toFixed(2)}</td>
                            <td style={{ padding: '1rem' }}>{product.category?.name || '-'}</td>
                            <td style={{ padding: '1rem' }}>
                                <button style={{ marginRight: '0.5rem' }}>✏️</button>
                                <button>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
