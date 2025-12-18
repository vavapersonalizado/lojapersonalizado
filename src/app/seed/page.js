"use client";

import { useState } from 'react';

export default function SeedPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const runSeed = async () => {
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/seed-public');
            const data = await res.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🌱 Database Seed</h1>

            <button
                onClick={runSeed}
                disabled={loading}
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    background: loading ? '#ccc' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '2rem'
                }}
            >
                {loading ? 'Restaurando...' : 'Restaurar Banco de Dados'}
            </button>

            {result && (
                <div style={{
                    padding: '1.5rem',
                    background: result.success ? '#dcfce7' : '#fee2e2',
                    borderRadius: '8px',
                    border: `1px solid ${result.success ? '#86efac' : '#fca5a5'}`
                }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
