"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const productId = params.id;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        price: '',
        stock: '',
        sizes: [],
        variants: [],
        attributes: [],
        categoryId: '',
        htmlContent: ''
    });

    const [variantForm, setVariantForm] = useState({ sizes: [], color: 'Branco', quantity: 0 });
    const [customColor, setCustomColor] = useState('');

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (session?.user?.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchProduct();
        fetchCategories();
    }, [session, status, router, productId]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${productId}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data);
                setFormData({
                    name: data.name || '',
                    sku: data.sku || '',
                    description: data.description || '',
                    price: data.price || '',
                    stock: data.stock === null ? null : data.stock,
                    sizes: data.sizes || [],
                    variants: data.variants || [],
                    attributes: data.attributes || [],
                    categoryId: data.categoryId || '',
                    htmlContent: data.htmlContent || ''
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: formData.stock === null || formData.stock === '' ? null : parseInt(formData.stock),
                    sizes: formData.sizes,
                    variants: formData.variants,
                    attributes: formData.attributes
                })
            });

            if (res.ok) {
                alert('Produto atualizado com sucesso!');
                router.push('/products');
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao atualizar produto');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Erro ao atualizar produto');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Produto excluído com sucesso!');
                router.push('/products');
            } else {
                alert('Erro ao excluir produto');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Erro ao excluir produto');
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Carregando...</div>;
    }

    if (!product) {
        return <div style={{ padding: '2rem' }}>Produto não encontrado</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                Editar Produto
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Nome do Produto
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            background: 'var(--background)'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Código (SKU)
                    </label>
                    <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Ex: PROD-001"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            background: 'var(--background)'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Descrição
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Variantes (Tamanho + Cor + Quantidade) */}
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: 'var(--radius)', border: '2px solid #3b82f6' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e40af' }}>
                        📦 Variantes (Tamanho + Cor + Quantidade)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                        Adicione combinações de tamanho e cor com quantidades em estoque.
                    </p>

                    {/* Add Variant Form */}
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'start' }}>
                            <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>Tamanho(s) - Selecione múltiplos</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'Único'].map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => {
                                                const currentSizes = variantForm.sizes;
                                                const newSizes = currentSizes.includes(size)
                                                    ? currentSizes.filter(s => s !== size)
                                                    : [...currentSizes, size];
                                                setVariantForm({ ...variantForm, sizes: newSizes });
                                            }}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                border: variantForm.sizes.includes(size) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                                background: variantForm.sizes.includes(size) ? '#eff6ff' : 'white',
                                                color: variantForm.sizes.includes(size) ? '#1e40af' : '#64748b',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: variantForm.sizes.includes(size) ? 'bold' : 'normal',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>Cor</label>
                                <select
                                    value={variantForm.color}
                                    onChange={(e) => {
                                        setVariantForm({ ...variantForm, color: e.target.value });
                                        if (e.target.value !== 'custom') setCustomColor('');
                                    }}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                >
                                    <option value="">Selecione...</option>
                                    {['Branco', 'Preto', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Rosa', 'Roxo', 'Laranja', 'Cinza', 'Marrom', 'Bege'].map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                    <option value="custom">✏️ Outra cor...</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>Quantidade (para cada)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={variantForm.quantity}
                                    onChange={(e) => setVariantForm({ ...variantForm, quantity: parseInt(e.target.value) || 0 })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const finalColor = variantForm.color === 'custom' ? customColor : variantForm.color;
                                        if (variantForm.sizes.length === 0 || !finalColor || variantForm.quantity <= 0) {
                                            alert('Selecione pelo menos um tamanho, uma cor e a quantidade!');
                                            return;
                                        }

                                        const newVariants = variantForm.sizes.map(size => ({
                                            size,
                                            color: finalColor,
                                            quantity: variantForm.quantity
                                        }));

                                        setFormData({
                                            ...formData,
                                            variants: [...(formData.variants || []), ...newVariants]
                                        });
                                        setVariantForm({ sizes: [], color: '', quantity: 0 });
                                        setCustomColor('');
                                    }}
                                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', height: '42px' }}
                                >
                                    ➕ Adicionar
                                </button>
                            </div>
                        </div>

                        {variantForm.color === 'custom' && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <input
                                    type="text"
                                    placeholder="Ex: Azul Marinho, Vermelho Sangue, Cor de Pele..."
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Variants Table */}
                    {
                        formData.variants && formData.variants.length > 0 ? (
                            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem' }}>Tamanho</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem' }}>Cor</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.85rem' }}>Quantidade</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.variants.map((variant, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '0.75rem' }}><strong>{variant.size}</strong></td>
                                                <td style={{ padding: '0.75rem' }}>{variant.color}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{variant.quantity} un.</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) })}
                                                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                                            <td colSpan="2" style={{ padding: '0.75rem' }}>Total: {formData.variants.length} variante(s)</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: '#3b82f6' }}>
                                                {formData.variants.reduce((sum, v) => sum + v.quantity, 0)} un.
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div style={{ background: 'white', padding: '2rem', textAlign: 'center', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Nenhuma variante adicionada.</p>
                            </div>
                        )
                    }
                </div >

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Código HTML para Banner (Embed/Iframe)
                    </label>
                    <textarea
                        value={formData.htmlContent}
                        onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                        rows={3}
                        placeholder="Insira o código HTML aqui..."
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem'
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Preço (¥)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--background)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Estoque
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="number"
                                step="1"
                                value={formData.stock === null ? '' : formData.stock}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData({ ...formData, stock: val === '' ? null : parseInt(val) });
                                }}
                                placeholder="Ilimitado"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)'
                                }}
                            />
                            {formData.stock === null && (
                                <span style={{ fontSize: '0.8rem', color: 'green', whiteSpace: 'nowrap' }}>∞ Ilimitado</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tamanhos */}
                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tamanhos Disponíveis</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {['P', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                            <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.sizes?.some(s => s.name === size && s.active) || false}
                                    onChange={e => {
                                        const currentSizes = formData.sizes || [];
                                        let newSizes;
                                        if (e.target.checked) {
                                            const exists = currentSizes.find(s => s.name === size);
                                            if (exists) {
                                                newSizes = currentSizes.map(s => s.name === size ? { ...s, active: true } : s);
                                            } else {
                                                newSizes = [...currentSizes, { name: size, active: true }];
                                            }
                                        } else {
                                            newSizes = currentSizes.map(s => s.name === size ? { ...s, active: false } : s);
                                        }
                                        setFormData({ ...formData, sizes: newSizes });
                                    }}
                                />
                                {size}
                            </label>
                        ))}
                    </div>

                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Outro tamanho (ex: 4XL)"
                            id="customSizeInput"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)' }}
                        />
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => {
                                const input = document.getElementById('customSizeInput');
                                const val = input.value.trim().toUpperCase();
                                if (val && !formData.sizes?.some(s => s.name === val)) {
                                    setFormData({
                                        ...formData,
                                        sizes: [...(formData.sizes || []), { name: val, active: true }]
                                    });
                                    input.value = '';
                                }
                            }}
                        >
                            +
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {formData.sizes?.filter(s => !['P', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(s.name) && s.active).map((s, i) => (
                            <span key={i} style={{ background: 'var(--muted)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {s.name}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newSizes = formData.sizes.filter(size => size.name !== s.name);
                                        setFormData({ ...formData, sizes: newSizes });
                                    }}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'red' }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Atributos */}
                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Atributos (Marca, Tecido, etc)</label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {formData.attributes?.map((attr, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={attr.name}
                                    onChange={e => {
                                        const newAttrs = [...formData.attributes];
                                        newAttrs[index].name = e.target.value;
                                        setFormData({ ...formData, attributes: newAttrs });
                                    }}
                                    placeholder="Nome (ex: Marca)"
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                />
                                <input
                                    type="text"
                                    value={attr.value}
                                    onChange={e => {
                                        const newAttrs = [...formData.attributes];
                                        newAttrs[index].value = e.target.value;
                                        setFormData({ ...formData, attributes: newAttrs });
                                    }}
                                    placeholder="Valor (ex: Nike)"
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newAttrs = formData.attributes.filter((_, i) => i !== index);
                                        setFormData({ ...formData, attributes: newAttrs });
                                    }}
                                    style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline"
                        style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                        onClick={() => {
                            setFormData({
                                ...formData,
                                attributes: [...(formData.attributes || []), { name: '', value: '', active: true }]
                            });
                        }}
                    >
                        + Adicionar Atributo
                    </button>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Categoria
                    </label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            background: 'var(--background)'
                        }}
                    >
                        <option value="">Sem categoria</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ flex: 1 }}
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/products')}
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                    >
                        Cancelar
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-outline"
                    style={{
                        marginTop: '2rem',
                        color: 'var(--destructive)',
                        borderColor: 'var(--destructive)'
                    }}
                >
                    🗑️ Excluir Produto
                </button>
            </form >
        </div >
    );
}
