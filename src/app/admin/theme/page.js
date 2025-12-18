"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import ImageUpload from '@/components/ImageUpload';

// Collapsible Section Component
function CollapsibleSection({ title, children, id, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    useEffect(() => {
        const savedState = localStorage.getItem(`theme_section_${id}`);
        if (savedState !== null) {
            setIsOpen(savedState === 'true');
        }
    }, [id]);

    const toggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        localStorage.setItem(`theme_section_${id}`, newState);
    };

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1rem' }}>
            <button
                onClick={toggle}
                style={{
                    width: '100%',
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderBottom: isOpen ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'var(--foreground)',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textAlign: 'left'
                }}
            >
                {title}
                <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    ▼
                </span>
            </button>
            {isOpen && (
                <div style={{ padding: '2rem' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default function AdminThemePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme, updateTheme } = useTheme();
    const [localTheme, setLocalTheme] = useState(null);
    const [saving, setSaving] = useState(false);
    const [activeScope, setActiveScope] = useState('global'); // 'global', 'home', 'product', etc.

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    useEffect(() => {
        if (theme) {
            setLocalTheme(JSON.parse(JSON.stringify(theme))); // Deep copy
        }
    }, [theme]);

    const handleColorChange = (key, value) => {
        if (!localTheme) return;

        const newTheme = { ...localTheme };

        if (activeScope === 'global') {
            newTheme.global[key] = value;
        } else {
            if (!newTheme.pages[activeScope]) newTheme.pages[activeScope] = {};
            newTheme.pages[activeScope][key] = value;
        }

        setLocalTheme(newTheme);
        updateTheme(newTheme); // Live preview
    };

    const handleTextChange = (key, value) => {
        const newTheme = { ...localTheme, texts: { ...localTheme.texts, [key]: value } };
        setLocalTheme(newTheme);
        updateTheme(newTheme);
    };

    const handleIconToggle = (category, index) => {
        const newTheme = { ...localTheme };
        newTheme.icons[category][index].visible = !newTheme.icons[category][index].visible;
        setLocalTheme(newTheme);
        updateTheme(newTheme);
    };

    const handleAddIcon = (category, value) => {
        const newTheme = { ...localTheme };
        newTheme.icons[category].push({ value, visible: true });
        setLocalTheme(newTheme);
        updateTheme(newTheme);
    };

    const handleRemoveIcon = (category, index) => {
        const newTheme = { ...localTheme };
        newTheme.icons[category].splice(index, 1);
        setLocalTheme(newTheme);
        updateTheme(newTheme);
    };

    const applyPreset = (type) => {
        const presets = {
            gold: {
                primary: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
                secondary: '#2C2C2C',
                accent: '#FFD700',
                background: '#0a0a0a',
                card: 'rgba(255, 215, 0, 0.1)',
                foreground: '#ffffff'
            },
            silver: {
                primary: 'linear-gradient(135deg, #E0E0E0, #F8F8F8, #B0B0B0, #F8F8F8, #A0A0A0)',
                secondary: '#1A1A1A',
                accent: '#C0C0C0',
                background: '#0f0f0f',
                card: 'rgba(192, 192, 192, 0.1)',
                foreground: '#ffffff'
            },
            bronze: {
                primary: 'linear-gradient(135deg, #cd7f32, #e6ac78, #a05a2c)',
                secondary: '#2e1a0f',
                accent: '#cd7f32',
                background: '#1a0f0a',
                card: 'rgba(205, 127, 50, 0.1)',
                foreground: '#ffffff'
            }
        };

        const selected = presets[type];
        if (selected) {
            const newTheme = { ...localTheme };
            if (activeScope === 'global') {
                newTheme.global = { ...newTheme.global, ...selected };
            } else {
                if (!newTheme.pages[activeScope]) newTheme.pages[activeScope] = {};
                newTheme.pages[activeScope] = { ...newTheme.pages[activeScope], ...selected };
            }
            setLocalTheme(newTheme);
            updateTheme(newTheme);
        }
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
        if (confirm('Tem certeza? Isso vai resetar todas as configurações.')) {
            // Reset logic would go here, likely fetching defaults again or hardcoding them
            window.location.reload();
        }
    };

    if (status === 'loading' || !localTheme) return <p>Carregando...</p>;

    const currentColors = activeScope === 'global' ? localTheme.global : (localTheme.pages[activeScope] || {});

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Personalizar Tema</h1>

            {/* Scope Selector */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {['global', 'home', 'product', 'cart', 'checkout', 'admin'].map(scope => (
                    <button
                        key={scope}
                        onClick={() => setActiveScope(scope)}
                        className={`btn ${activeScope === scope ? 'btn-primary' : 'btn-outline'}`}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {scope === 'global' ? '🌐 Global (Todo o Site)' : scope}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Controls */}
                <div>
                    <CollapsibleSection title={`Cores: ${activeScope.toUpperCase()}`} id="colors" defaultOpen={true}>

                        {/* Presets */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Predefinições Metálicas</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => applyPreset('gold')} className="btn" style={{ background: 'linear-gradient(135deg, #BF953F, #FCF6BA)', color: '#000', border: 'none' }}>Ouro</button>
                                <button onClick={() => applyPreset('silver')} className="btn" style={{ background: 'linear-gradient(135deg, #E0E0E0, #F8F8F8)', color: '#000', border: 'none' }}>Prata</button>
                                <button onClick={() => applyPreset('bronze')} className="btn" style={{ background: 'linear-gradient(135deg, #cd7f32, #e6ac78)', color: '#000', border: 'none' }}>Bronze</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {['primary', 'secondary', 'accent', 'background', 'card', 'foreground'].map(key => (
                                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ textTransform: 'capitalize' }}>{key}</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={currentColors[key]?.startsWith('linear') ? '#000000' : (currentColors[key] || '#000000')}
                                            onChange={(e) => handleColorChange(key, e.target.value)}
                                            style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                            disabled={currentColors[key]?.startsWith('linear')} // Disable color picker for gradients
                                        />
                                        <input
                                            type="text"
                                            value={currentColors[key] || ''}
                                            onChange={(e) => handleColorChange(key, e.target.value)}
                                            placeholder={activeScope === 'global' ? 'Obrigatório' : 'Padrão (Global)'}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    {currentColors[key]?.startsWith('linear') && (
                                        <small style={{ color: 'var(--accent)' }}>Gradiente Ativo (Edite o texto para mudar)</small>
                                    )}
                                </div>
                            ))}

                            {activeScope === 'global' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label>Arredondamento (Radius)</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={parseFloat(localTheme.global.radius) || 0}
                                        onChange={(e) => handleColorChange('radius', `${e.target.value}rem`)}
                                        style={{ width: '100%' }}
                                    />
                                    <span>{localTheme.global.radius}</span>
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Efeitos Visuais" id="effects">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Estilo dos Botões</label>
                                <select
                                    value={localTheme.global?.effects?.button || 'none'}
                                    onChange={(e) => handleColorChange('effects', { ...localTheme.global.effects, button: e.target.value })}
                                    className="input"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                >
                                    <option value="none">Padrão (Flat)</option>
                                    <option value="chrome">Cromado / Metálico</option>
                                    <option value="glass">Vidro (Glassmorphism)</option>
                                    <option value="neon">Neon (Brilho)</option>
                                </select>
                            </div>

                            {localTheme.global?.effects?.button === 'chrome' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Cor do Cromado</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={localTheme.global?.effects?.chromeColor || '#e0e0e0'}
                                            onChange={(e) => handleColorChange('effects', { ...localTheme.global.effects, chromeColor: e.target.value })}
                                            style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            value={localTheme.global?.effects?.chromeColor || '#e0e0e0'}
                                            onChange={(e) => handleColorChange('effects', { ...localTheme.global.effects, chromeColor: e.target.value })}
                                            className="input"
                                            style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Animações</label>
                                <select
                                    value={localTheme.global?.effects?.animation || 'none'}
                                    onChange={(e) => handleColorChange('effects', { ...localTheme.global.effects, animation: e.target.value })}
                                    className="input"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                >
                                    <option value="none">Nenhuma</option>
                                    <option value="pulse">Pulsar (Suave)</option>
                                    <option value="shimmer">Brilho Passando (Shimmer)</option>
                                    <option value="float">Flutuar</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="showSiteTitle"
                                    checked={localTheme.global?.showSiteTitle !== false}
                                    onChange={(e) => handleColorChange('showSiteTitle', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label htmlFor="showSiteTitle" style={{ cursor: 'pointer' }}>Mostrar Título do Site no Cabeçalho</label>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Banner da Home" id="homeBanner">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Imagem de Fundo</label>
                                <div style={{ marginBottom: '1rem' }}>
                                    <ImageUpload
                                        onUpload={(url) => handleColorChange('homeBannerImage', url)}
                                        maxFiles={1}
                                    />
                                </div>
                                {localTheme.global?.homeBannerImage && (
                                    <div style={{
                                        width: '100%',
                                        height: '200px',
                                        background: `url(${localTheme.global.homeBannerImage}) center/cover no-repeat`,
                                        borderRadius: 'var(--radius)',
                                        position: 'relative',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <button
                                            onClick={() => handleColorChange('homeBannerImage', '')}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'rgba(0,0,0,0.7)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '30px',
                                                height: '30px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="showBannerOverlay"
                                    checked={localTheme.global?.showBannerOverlay !== false}
                                    onChange={(e) => handleColorChange('showBannerOverlay', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label htmlFor="showBannerOverlay" style={{ cursor: 'pointer' }}>Mostrar Camada Escura (Melhora leitura do texto)</label>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {activeScope === 'global' && (
                        <>
                            <CollapsibleSection title="Textos do Site" id="texts">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {localTheme.texts && Object.entries(localTheme.texts).map(([key, value]) => (
                                        <div key={key}>
                                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                                {key}
                                            </label>
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleTextChange(key, e.target.value)}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Ícones Dinâmicos" id="icons">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {localTheme.icons && Object.entries(localTheme.icons).map(([category, icons]) => (
                                        <div key={category} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                            <h4 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>{category}</h4>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                                {icons.map((icon, index) => (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem',
                                                        background: 'var(--muted)',
                                                        borderRadius: '4px',
                                                        border: icon.visible ? '1px solid var(--accent)' : '1px solid transparent',
                                                        opacity: icon.visible ? 1 : 0.5
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={icon.visible}
                                                            onChange={() => handleIconToggle(category, index)}
                                                        />
                                                        <span style={{ fontSize: '1.5rem' }}>{icon.value}</span>
                                                        <button
                                                            onClick={() => handleRemoveIcon(category, index)}
                                                            style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Emoji ou URL"
                                                    id={`newIcon-${category}`}
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => {
                                                        const input = document.getElementById(`newIcon-${category}`);
                                                        if (input.value) {
                                                            handleAddIcon(category, input.value);
                                                            input.value = '';
                                                        }
                                                    }}
                                                >
                                                    Adicionar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleSection>
                        </>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                        <button onClick={handleReset} className="btn btn-outline">
                            Restaurar Padrão
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2>Preview ({activeScope})</h2>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3>Exemplo de Card</h3>
                        <p>Este card está usando as cores definidas para: <strong>{activeScope}</strong></p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary">Botão Primário</button>
                            <button className="btn btn-secondary">Botão Secundário</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
