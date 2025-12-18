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
        variants: [], // New: [{size, color, quantity}]
        htmlContent: '',
        isCustomizable: false,
        model3D: '',
        modelType: '',
        printWidth: '',
        printHeight: ''
    });

    // Variant form state
    const [variantForm, setVariantForm] = useState({
        size: '',
        color: '',
        quantity: 0
    });
    const [customColor, setCustomColor] = useState('');


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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>Tamanho</label>
                                        <select
                                            value={variantForm.size}
                                            onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                        >
                                            <option value="">Selecione...</option>
                                            {['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'Único'].map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
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
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>Quantidade</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={variantForm.quantity}
                                            onChange={(e) => setVariantForm({ ...variantForm, quantity: parseInt(e.target.value) || 0 })}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const finalColor = variantForm.color === 'custom' ? customColor : variantForm.color;
                                            if (!variantForm.size || !finalColor || variantForm.quantity <= 0) {
                                                alert('Preencha todos os campos!');
                                                return;
                                            }
                                            setFormData({
                                                ...formData,
                                                variants: [...(formData.variants || []), { size: variantForm.size, color: finalColor, quantity: variantForm.quantity }]
                                            });
                                            setVariantForm({ size: '', color: '', quantity: 0 });
                                            setCustomColor('');
                                        }}
                                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        ➕ Adicionar
                                    </button>
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
                            {formData.variants && formData.variants.length > 0 ? (
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
                            )}
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
