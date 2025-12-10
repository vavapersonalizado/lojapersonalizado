"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function CategoryPage() {
    const params = useParams();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc, name-asc

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

    const getSortedProducts = () => {
        const sorted = [...products];
        switch (sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'newest':
            default:
                // Assuming default order from API is newest or by ID
                return sorted;
        }
    };

    if (loading) {
        return <p style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</p>;
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <Breadcrumbs items={[
                { label: 'Categorias', href: '/products' }, // Or a categories list page if it existed
                { label: category.name }
            ]} />

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{category.name}</h1>
                    <p style={{ color: '#000000', marginTop: '0.5rem' }}>
                        {products.length} {products.length === 1 ? 'produto' : 'produtos'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            color: '#000000'
                        }}
                    >
                        <option value="newest">Mais Recentes</option>
                        <option value="price-asc">Preço: Menor para Maior</option>
                        <option value="price-desc">Preço: Maior para Menor</option>
                        <option value="name-asc">Nome: A-Z</option>
                    </select>

                    {isAdmin && (
                        <Link href="/admin/products/new" className="btn btn-primary">
                            ➕ Adicionar Produto
                        </Link>
                    )}
                </div>
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
                    <p style={{ fontSize: '1.1rem', color: '#000000', marginBottom: '2rem' }}>
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
                    {getSortedProducts().map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
