"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminProductsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) return;
        if (session.user.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchProducts();
    }, [session, router]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = async (productId, currentVisibility) => {
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visible: !currentVisibility })
            });

            if (res.ok) {
                fetchProducts(); // Refresh list
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
        }
    };

    const deleteProduct = async (productId, productName) => {
        if (!confirm(`Tem certeza que deseja deletar "${productName}"?`)) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchProducts(); // Refresh list
            } else {
                alert('Erro ao deletar produto');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Erro ao deletar produto');
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Carregando...</div>;
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Gerenciar Produtos</h1>
                <Link href="/admin/products/new" className="btn btn-primary">
                    ➕ Adicionar Produto
                </Link>
            </div>

            {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--card)', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Nenhum produto cadastrado</p>
                    <Link href="/admin/products/new" className="btn btn-primary">
                        Cadastrar Primeiro Produto
                    </Link>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card)', borderRadius: 'var(--radius)' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Imagem</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nome</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>SKU</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Preço</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Estoque</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Visível</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {product.images?.[0] ? (
                                            product.images[0].match(/\.(mp4|webm|ogg)$/i) ? (
                                                <video
                                                    src={product.images[0]}
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                    muted
                                                    loop
                                                    playsInline
                                                    onMouseOver={e => e.target.play()}
                                                    onMouseOut={e => e.target.pause()}
                                                />
                                            ) : (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            )
                                        ) : (
                                            <div style={{ width: '60px', height: '60px', background: 'var(--muted)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                📦
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{product.name}</div>
                                        {product.category && (
                                            <div style={{ fontSize: '0.875rem', color: '#000000' }}>
                                                {product.category.name}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#000000' }}>
                                        {product.sku || '-'}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                                        ¥{product.price.toFixed(0)}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            background: product.stock > 0 ? '#d4edda' : '#f8d7da',
                                            color: product.stock > 0 ? '#155724' : '#721c24',
                                            fontSize: '0.875rem'
                                        }}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={product.visible !== false}
                                            onChange={() => toggleVisibility(product.id, product.visible)}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            title={product.visible ? 'Visível para clientes' : 'Oculto dos clientes'}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                                className="btn btn-outline"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product.id, product.name)}
                                                className="btn"
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    background: '#dc3545',
                                                    color: 'white',
                                                    border: 'none'
                                                }}
                                            >
                                                🗑️ Deletar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
