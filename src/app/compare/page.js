"use client";

import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();
    const { formatCurrency } = useLanguage();
    const router = useRouter();

    if (compareList.length === 0) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Comparação de Produtos</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Você não tem produtos para comparar.</p>
                <Link href="/products" className="btn btn-primary">
                    Explorar Produtos
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Comparação de Produtos ({compareList.length})</h1>
                <button
                    onClick={clearCompare}
                    style={{
                        background: 'none',
                        border: '1px solid #ddd',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Limpar Tudo
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', width: '200px' }}>Característica</th>
                            {compareList.map(product => (
                                <th key={product.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee', minWidth: '200px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => removeFromCompare(product.id)}
                                            style={{
                                                position: 'absolute',
                                                top: -10,
                                                right: 0,
                                                background: '#eee',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Remover"
                                        >
                                            ×
                                        </button>
                                        <div
                                            style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', cursor: 'pointer' }}
                                            onClick={() => router.push(`/products/${product.id}`)}
                                        >
                                            {product.images && product.images[0] ? (
                                                <img src={product.images[0]} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ width: '100px', height: '100px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sem img</div>
                                            )}
                                        </div>
                                        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                                            {product.name}
                                        </Link>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>Preço</td>
                            {compareList.map(product => (
                                <td key={product.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    {formatCurrency(product.price)}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td style={{ padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>Categoria</td>
                            {compareList.map(product => (
                                <td key={product.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                    {product.category?.name || '-'}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td style={{ padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>Disponibilidade</td>
                            {compareList.map(product => (
                                <td key={product.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                    {product.stock > 0 ? (
                                        <span style={{ color: 'green' }}>Em Estoque ({product.stock})</span>
                                    ) : (
                                        <span style={{ color: 'red' }}>Esgotado</span>
                                    )}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td style={{ padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>Personalizável</td>
                            {compareList.map(product => (
                                <td key={product.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                    {product.isCustomizable ? '✅ Sim' : '❌ Não'}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td style={{ padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>Descrição</td>
                            {compareList.map(product => (
                                <td key={product.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                                    {product.description ? (product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description) : '-'}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}></td>
                            {compareList.map(product => (
                                <td key={product.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                    {product.isCustomizable ? (
                                        <Link href={`/products/custom/${product.id}`} className="btn btn-primary" style={{ display: 'block', width: '100%', textDecoration: 'none', padding: '0.5rem' }}>
                                            Personalizar
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(product, 1)}
                                            disabled={product.stock <= 0}
                                            className="btn btn-primary"
                                            style={{ width: '100%' }}
                                        >
                                            Adicionar
                                        </button>
                                    )}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
