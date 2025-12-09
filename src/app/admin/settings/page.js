"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [restoring, setRestoring] = useState(false);
    const [message, setMessage] = useState('');

    const handleDownloadBackup = async () => {
        try {
            const res = await fetch('/api/admin/backup');
            if (!res.ok) throw new Error('Failed to fetch backup');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            setMessage('Erro ao baixar backup');
        }
    };

    const handleRestoreBackup = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm('ATENÇÃO: Isso irá sobrescrever dados existentes. Tem certeza?')) {
            e.target.value = '';
            return;
        }

        setRestoring(true);
        setMessage('');

        try {
            const text = await file.text();
            const json = JSON.parse(text);

            const res = await fetch('/api/admin/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Restore failed');

            setMessage('✅ Restauração concluída com sucesso!');
        } catch (error) {
            console.error('Restore error:', error);
            setMessage('❌ Erro na restauração: ' + error.message);
        } finally {
            setRestoring(false);
            e.target.value = '';
        }
    };

    if (session?.user?.role !== 'admin') {
        return <div style={{ padding: '2rem' }}>Acesso negado</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Configurações</h1>

            <div style={{
                background: 'var(--card)',
                padding: '2rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>📦 Backup e Restauração</h2>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
                    Faça o download de todos os seus dados (Produtos, Clientes, Cupons) ou restaure um backup anterior.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Export Section */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Exportar Dados</h3>
                        <button
                            onClick={handleDownloadBackup}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            ⬇️ Baixar Backup Completo (.json)
                        </button>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border)' }}></div>

                    {/* Import Section */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Restaurar Dados</h3>
                        <div style={{
                            border: '2px dashed var(--border)',
                            padding: '2rem',
                            borderRadius: 'var(--radius)',
                            textAlign: 'center'
                        }}>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleRestoreBackup}
                                disabled={restoring}
                                style={{ display: 'none' }}
                                id="backup-upload"
                            />
                            <label
                                htmlFor="backup-upload"
                                className="btn btn-outline"
                                style={{ cursor: 'pointer', display: 'inline-block' }}
                            >
                                {restoring ? '⏳ Restaurando...' : '⬆️ Selecionar Arquivo de Backup'}
                            </label>
                            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                                Selecione um arquivo .json gerado anteriormente
                            </p>
                        </div>
                    </div>
                </div>

                {/* Seed Rules Section */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>🎫 Regras de Cupom</h2>
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                        Inicialize as regras padrão de cupom (ex: Primeira Compra) se elas não existirem.
                    </p>
                    <button
                        onClick={async () => {
                            if (!confirm('Deseja inicializar as regras de cupom?')) return;
                            try {
                                const res = await fetch('/api/admin/seed-coupons', { method: 'POST' });
                                const data = await res.json();
                                if (res.ok) setMessage('✅ ' + data.message);
                                else throw new Error(data.error);
                            } catch (e) {
                                setMessage('❌ ' + e.message);
                            }
                        }}
                        className="btn btn-secondary"
                    >
                        🚀 Inicializar Regras Padrão
                    </button>
                </div>

                {message && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        background: message.includes('Erro') || message.includes('❌') ? '#fee2e2' : '#dcfce7',
                        color: message.includes('Erro') || message.includes('❌') ? '#991b1b' : '#166534',
                        fontWeight: '500'
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
