"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        categoryId: '',
        image: ''
    });

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);

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
        <div style={{ maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Novo Produto</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Preço</label>
                    <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Categoria</label>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>URL da Imagem</label>
                    <input
                        type="url"
                        className="input"
                        value={formData.image}
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://exemplo.com/imagem.jpg"
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Salvar Produto
                </button>
            </form>
        </div>
    );
}
