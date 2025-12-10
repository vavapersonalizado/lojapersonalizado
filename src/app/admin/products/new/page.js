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
        htmlContent: '',
        isCustomizable: false,
        model3D: '',
        modelType: '',
        printWidth: '',
        printHeight: ''
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

    const handleAdd3DModel = (url, type = '3d') => {
        const extension = url.split('.').pop().toLowerCase();
        const modelType = ['glb', 'gltf', 'obj', 'fbx'].includes(extension) ? extension : 'glb';

        setFormData(prev => ({
            ...prev,
            model3D: url,
            modelType: modelType
        }));
    };

    const handleRemove3DModel = () => {
        setFormData(prev => ({
            ...prev,
            model3D: '',
            modelType: ''
        }));
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
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="Ex: 12345678"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={async () => {
                                        const res = await fetch('/api/products/sku');
                                        if (res.ok) {
                                            const data = await res.json();
                                            setFormData(prev => ({ ...prev, sku: data.sku }));
                                        }
                                    }}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    Gerar Código
                                </button>
                            </div>
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

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isCustomizable}
                                    onChange={e => setFormData({ ...formData, isCustomizable: e.target.checked })}
                                />
                                <span style={{ fontWeight: 'bold' }}>🎨 Produto Personalizável</span>
                            </label>
                            <p style={{ fontSize: '0.8rem', color: '#000000', marginLeft: '1.5rem' }}>
                                Se marcado, o cliente poderá adicionar fotos, textos e adesivos a este produto.
                            </p>
                        </div>

                        {/* Print Dimensions */}
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: 'var(--radius)', border: '1px solid #e0e0e0' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>📏 Dimensões para Impressão</h3>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                                Configure as dimensões reais do produto para gerar arquivos de impressão com tamanho correto.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Largura (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.printWidth}
                                        onChange={e => setFormData({ ...formData, printWidth: e.target.value })}
                                        placeholder="10.0"
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Altura (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.printHeight}
                                        onChange={e => setFormData({ ...formData, printHeight: e.target.value })}
                                        placeholder="10.0"
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                            </div>
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
                                        color: '#000000',
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

                        {/* 3D Model Section */}
                        <div style={{ marginTop: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                🧊 Modelo 3D (Opcional)
                            </label>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                                Adicione um modelo 3D (.glb, .gltf, .obj, .fbx) para visualização interativa
                            </p>

                            {!formData.model3D ? (
                                <div>
                                    <MediaSelector
                                        onSelect={handleAdd3DModel}
                                        buttonText="Selecionar Modelo 3D da Galeria"
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>
                                        Formatos aceitos: .glb, .gltf, .obj, .fbx (max 100MB)
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    border: '2px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '1rem',
                                    background: 'var(--muted)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                                Modelo 3D Carregado
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                Tipo: {formData.modelType.toUpperCase()}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemove3DModel}
                                            className="btn btn-outline"
                                            style={{ color: 'red', borderColor: 'red' }}
                                        >
                                            🗑️ Remover
                                        </button>
                                    </div>
                                    <div style={{
                                        background: '#f0f0f0',
                                        borderRadius: 'var(--radius)',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        color: '#666'
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🧊</div>
                                        <div style={{ fontSize: '0.9rem' }}>Preview 3D disponível na página do produto</div>
                                    </div>
                                </div>
                            )}
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
