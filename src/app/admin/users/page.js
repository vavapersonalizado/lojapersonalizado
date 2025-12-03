"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (session?.user?.role !== 'admin') {
            router.push('/');
            return;
        }

        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [session, status, router]);

    if (loading) return <p style={{ padding: '2rem' }}>Carregando usuários...</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Gerenciar Clientes</h1>

            <div style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--muted)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Nome</th>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>Função</th>
                            <th style={{ padding: '1rem' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name}
                                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                        />
                                    ) : (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {user.name?.[0] || '?'}
                                        </div>
                                    )}
                                    {user.name || 'Sem nome'}
                                </td>
                                <td style={{ padding: '1rem' }}>{user.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        background: user.role === 'admin' ? 'var(--primary)' : 'var(--secondary)',
                                        color: user.role === 'admin' ? 'var(--primary-foreground)' : 'var(--secondary-foreground)'
                                    }}>
                                        {user.role === 'admin' ? 'Admin' : 'Cliente'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                                        Detalhes
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
