"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminThemePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme, updateTheme } = useTheme();
    const [localTheme, setLocalTheme] = useState(theme);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    useEffect(() => {
        if (theme) {
            setLocalTheme(theme);
        }
    }, [theme]);

    const handleChange = (key, value) => {
        const newTheme = { ...localTheme, [key]: value };
        setLocalTheme(newTheme);
        // Live preview by updating context temporarily (optional, but good for UX)
        updateTheme(newTheme);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: localTheme })
            });

            if (res.ok) {
                alert('Tema salvo com sucesso!');
            } else {
                alert('Erro ao salvar tema');
            }
        } catch (error) {
            console.error('Error saving theme:', error);
            alert('Erro ao salvar tema');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        const defaultTheme = {
            primary: '#7C3AED',
            secondary: '#F472B6',
            accent: '#00f2fe',
            background: '#0a0e27',
            foreground: '#ffffff',
            card: 'rgba(255, 255, 255, 0.05)',
            radius: '1rem'
        };
        setLocalTheme(defaultTheme);
        updateTheme(defaultTheme);
    };

    if (status === 'loading') return <p>Carregando...</p>;

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Personalizar Tema</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Controls */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Cores e Estilo</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Cor Primária</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={localTheme.primary}
                                    onChange={(e) => handleChange('primary', e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={localTheme.primary}
                                    onChange={(e) => handleChange('primary', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Cor Secundária</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={localTheme.secondary}
                                    onChange={(e) => handleChange('secondary', e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={localTheme.secondary}
                                    onChange={(e) => handleChange('secondary', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Cor de Destaque (Accent)</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={localTheme.accent}
                                    onChange={(e) => handleChange('accent', e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={localTheme.accent}
                                    onChange={(e) => handleChange('accent', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Fundo (Background)</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={localTheme.background}
                                    onChange={(e) => handleChange('background', e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={localTheme.background}
                                    onChange={(e) => handleChange('background', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Texto (Foreground)</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={localTheme.foreground}
                                    onChange={(e) => handleChange('foreground', e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={localTheme.foreground}
                                    onChange={(e) => handleChange('foreground', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Arredondamento (Radius)</label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={parseFloat(localTheme.radius) || 0}
                                onChange={(e) => handleChange('radius', `${e.target.value}rem`)}
                                style={{ width: '100%' }}
                            />
                            <span>{localTheme.radius}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <button onClick={handleReset} className="btn btn-outline">
                                Restaurar Padrão
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2>Preview</h2>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3>Exemplo de Card</h3>
                        <p style={{ margin: '1rem 0', opacity: 0.8 }}>
                            Este é um exemplo de como os elementos ficarão com as novas cores.
                            O efeito glassmorphism e as sombras são aplicados automaticamente.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary">Botão Primário</button>
                            <button className="btn btn-secondary">Botão Secundário</button>
                            <button className="btn btn-outline">Botão Outline</button>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)' }}>
                        <h3>Elementos de Formulário</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <input type="text" placeholder="Input de texto moderno" />
                            <select>
                                <option>Opção Selecionada</option>
                                <option>Outra Opção</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
