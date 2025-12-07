"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import MediaSelector from '@/components/MediaSelector';

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        description: '',
        categoryId: '',
        images: [],
        stock: '',
        htmlContent: ''
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

    const handleAddImage = (url, type = 'image') => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, { url, type }]
        }));
        console.log('Image added:', url, type);
    };

    const handleRemoveImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
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
        <div style={{ maxWidth: '1200px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Novo Produto</h1>

            <form onSubmit={handleSubmit}>
                <div className="product-form-container">
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
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Código (SKU)</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="Ex: PROD-001"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Estoque</label>
                                <input
                                    type="number"
                                    step="1"
                                    className="input"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Código HTML para Banner (Embed/Iframe)</label>
                            <textarea
                                className="input"
                                style={{ height: '80px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                                value={formData.htmlContent}
                                onChange={e => setFormData({ ...formData, htmlContent: e.target.value })}
                                placeholder="Insira o código HTML aqui..."
                            />
                        </div>
                    </div>

                    {/* Right Column - Image Gallery */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Adicionar Imagem</label>
                            <ImageUpload onUpload={handleAddImage} />
                            <div style={{ marginTop: '0.5rem' }}>
                                <MediaSelector onSelect={handleAddImage} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Imagens do Produto ({formData.images.length})
                            </label>
                            <div style={{
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '1rem',
                                minHeight: '300px',
                                background: 'var(--muted)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: '1rem'
                            }}>
                                {formData.images.length === 0 ? (
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--muted-foreground)',
                                        textAlign: 'center',
                                        padding: '2rem'
                                    }}>
                                        <p>Nenhuma imagem adicionada ainda.<br />Use o campo acima para adicionar imagens.</p>
                                    </div>
                                ) : (
                                    formData.images.map((media, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <div style={{
                                                width: '100%',
                                                paddingBottom: '100%',
                                                borderRadius: 'var(--radius)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                background: 'var(--muted)'
                                            }}>
                                                {media.type === 'video' ? (
                                                    <video
                                                        src={media.url}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                        muted
                                                        loop
                                                        playsInline
                                                    />
                                                ) : media.url.endsWith('.glb') || media.url.endsWith('.gltf') ? (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        background: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column'
                                                    }}>
                                                        <span style={{ fontSize: '2rem' }}>🧊</span>
                                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Modelo 3D</span>
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        background: `url(${media.url}) center/cover`
                                                    }} />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '0.5rem',
                                                        right: '0.5rem',
                                                        background: 'rgba(0,0,0,0.7)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        cursor: 'pointer',
                                                        fontSize: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        zIndex: 10
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
                    Salvar Produto
                </button>
            </form>

            <style jsx global>{`
                .product-form-container {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }

                @media (min-width: 768px) {
                    .product-form-container {
                        grid-template-columns: 40% 60%;
                    }
                }
            `}</style>
        </div>
    );
}
