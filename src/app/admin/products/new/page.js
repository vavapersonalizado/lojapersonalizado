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
        sizes: [],
        color: '',
        quantity: 0
    });
    const [customColor, setCustomColor] = useState('');


    const [mounted, setMounted] = useState(false);

    const loadCategories = () => {
        fetch('/api/categories')
        // ... (rest of the file remains unchanged until the form render)
    };

    // ... (skip to render)

    {/* Add Variant Form */ }
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

    {/* Variants Table */ }
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

    {/* Print Dimensions */ }
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
                    </div >

        {/* Right Column - Image Gallery */ }
        < div style = {{ display: 'flex', flexDirection: 'column', gap: '1rem' }
}>
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

{/* 3D Model Section */ }
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
                    </div >
                </div >

    <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
        Salvar Produto
    </button>
            </form >

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
        </div >
    );
}
