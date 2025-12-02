"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        categoryId: '',
        image: ''
    });

    const loadCategories = () => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data));
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        const slug = newCategoryName.toLowerCase().replace(/ /g, '-');
        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newCategoryName, slug })
        });

        if (res.ok) {
            const newCat = await res.json();
            setCategories([...categories, newCat]);
            setFormData({ ...formData, categoryId: newCat.id });
            setNewCategoryName('');
            setShowNewCategory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            router.push('/admin/products');
        } else {
            alert('Erro ao criar produto');
        }
    };

    return (
        <div style={{ maxWidth: '1000px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Novo Produto</h1>

            <form onSubmit={handleSubmit}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '2rem',
                    '@media (min-width: 768px)': {
                        gridTemplateColumns: '1fr 350px'
                    }
                }}>
                    {/* Left Column - Form Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Preço (¥)</label>
                            <input
                                type="number"
                                step="1"
                                className="input"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="1000"
                                required
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label>Categoria</label>
                                {!showNewCategory && (
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowNewCategory(true)}
                                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                                    >
                                        + Nova
                                    </button>
                                )}
                            </div>
                            {!showNewCategory ? (
                                <select
                                    className="input"
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowNewCategory(true)}
                                    >
                                        + Nova
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        style={{ flex: 1 }}
                                        placeholder="Nome da nova categoria"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleAddCategory}
                                    >
                                        Adicionar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowNewCategory(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descrição</label>
                            <textarea
                                className="input"
                                style={{ height: '100px' }}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Right Column / Bottom on Mobile - Image Upload */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Imagem do Produto</label>
                        <ImageUpload onUpload={(url) => setFormData({ ...formData, image: url })} />
                        {formData.image && (
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                ✓ Imagem carregada
                            </p>
                        )}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
                    Salvar Produto
                </button>
            </form >
        </div >
    );
}
