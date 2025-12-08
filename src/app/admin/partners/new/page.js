"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewPartnerPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        link: '',
        active: true
    });
    const [loading, setLoading] = useState(false);

    if (status === 'unauthenticated') {
        router.push('/');
        return null;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
        router.push('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/partners');
                router.refresh();
            } else {
                alert('Erro ao criar parceiro');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao criar parceiro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Novo Parceiro</h1>

            <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nome</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Logo URL (Opcional)</label>
                    <input
                        type="url"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="https://..."
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Link do Site (Opcional)</label>
                    <input
                        type="url"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        placeholder="https://..."
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <label htmlFor="active">Ativo</label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                    >
                        {loading ? 'Salvando...' : 'Salvar Parceiro'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn btn-outline"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
