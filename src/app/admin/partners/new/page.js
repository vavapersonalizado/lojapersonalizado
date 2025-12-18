"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

export default function NewPartnerPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        link: '',
        logo: '',
        active: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/admin/partners');
            } else {
                alert('Erro ao criar parceiro');
            }
        } catch (error) {
            console.error('Error creating partner:', error);
            alert('Erro ao criar parceiro');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Novo Parceiro / Patrocinador</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome</label>
                    <input
                        type="text"
                        className="input"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Link (Site ou Rede Social)</label>
                    <input
                        type="url"
                        className="input"
                        value={formData.link}
                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                        placeholder="https://..."
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Logo</label>
                    <div style={{ marginBottom: '1rem' }}>
                        <ImageUpload
                            onUpload={(url) => setFormData({ ...formData, logo: url })}
                            maxFiles={1}
                        />
                    </div>
                    {formData.logo && (
                        <div style={{
                            width: '150px',
                            height: '150px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem'
                        }}>
                            <img src={formData.logo} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="active" style={{ cursor: 'pointer' }}>Ativo</label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                        Salvar Parceiro
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => router.back()}
                        style={{ flex: 1 }}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
