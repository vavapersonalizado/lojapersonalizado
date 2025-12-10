"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function BackupsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [lastBackup, setLastBackup] = useState(null);

    if (status === 'unauthenticated') {
        router.push('/');
        return null;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
        router.push('/');
        return null;
    }

    const handleDownloadBackup = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/backup');
            if (!res.ok) throw new Error('Falha ao gerar backup');

            const data = await res.json();

            // Create blob and download
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_projetovava_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('Backup baixado com sucesso!');
        } catch (error) {
            console.error('Error downloading backup:', error);
            alert('Erro ao baixar backup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCloudBackup = async () => {
        setUploading(true);
        try {
            // 1. Get data
            const resData = await fetch('/api/admin/backup');
            if (!resData.ok) throw new Error('Falha ao gerar dados para backup');
            const data = await resData.json();

            // 2. Upload to Cloudinary
            const resUpload = await fetch('/api/admin/backup/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, timestamp: new Date().toISOString() })
            });

            if (!resUpload.ok) {
                const errData = await resUpload.json();
                throw new Error(errData.error || 'Falha no upload');
            }

            const result = await resUpload.json();
            setLastBackup(result);
            alert('Backup enviado para a nuvem com sucesso!');
        } catch (error) {
            console.error('Error uploading backup:', error);
            alert('Erro ao enviar backup: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#000' }}>
                Sistema de Backup
            </h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Backup Manual</h2>
                <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                    Baixe uma cópia completa de todos os dados do banco de dados (Produtos, Usuários, Pedidos, etc.) em formato JSON.
                </p>
                <button
                    onClick={handleDownloadBackup}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {loading ? 'Gerando...' : '📥 Baixar Backup (JSON)'}
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Backup na Nuvem (Cloudinary)</h2>
                <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                    Envie um backup criptografado diretamente para o seu armazenamento seguro no Cloudinary.
                </p>
                <button
                    onClick={handleCloudBackup}
                    disabled={uploading}
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {uploading ? 'Enviando...' : '☁️ Enviar para Nuvem'}
                </button>

                {lastBackup && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#e6fffa', borderRadius: 'var(--radius)', border: '1px solid #b2f5ea' }}>
                        <p style={{ color: '#2c7a7b', fontWeight: 'bold' }}>✅ Último backup realizado com sucesso!</p>
                        <p style={{ fontSize: '0.9rem', color: '#285e61' }}>Data: {new Date(lastBackup.created_at).toLocaleString()}</p>
                        <p style={{ fontSize: '0.9rem', color: '#285e61' }}>ID: {lastBackup.public_id}</p>
                    </div>
                )}
            </div>

            <div className="card" style={{ background: '#f7fafc' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d3748' }}>⚙️ Automação (Cron Job)</h2>
                <p style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '1rem' }}>
                    Para configurar backups automáticos no Vercel Cron, adicione a seguinte configuração ao seu `vercel.json`:
                </p>
                <pre style={{ background: '#2d3748', color: '#fff', padding: '1rem', borderRadius: 'var(--radius)', overflowX: 'auto', fontSize: '0.85rem' }}>
                    {`{
  "crons": [
    {
      "path": "/api/admin/backup/upload",
      "schedule": "0 3 * * *"
    }
  ]
}`}
                </pre>
                <p style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '1rem' }}>
                    Isso executará o backup todos os dias às 3:00 AM. Certifique-se de configurar a variável de ambiente `CRON_SECRET` no Vercel.
                </p>
            </div>
        </div>
    );
}
