"use client";

import { useState, useEffect } from 'react';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = () => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const slug = newCategory.toLowerCase().replace(/ /g, '-');

        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newCategory, slug })
        });

        if (res.ok) {
            setNewCategory('');
            loadCategories();
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Categorias</h1>

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    className="input"
                    placeholder="Nova Categoria"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    required
                />
                <button type="submit" className="btn btn-primary">Adicionar</button>
            </form>

            <ul style={{ listStyle: 'none' }}>
                {categories.map(cat => (
                    <li key={cat.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--foreground)' }}>{cat.name}</span>
                        <span style={{ color: '#000000' }}>/{cat.slug}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
