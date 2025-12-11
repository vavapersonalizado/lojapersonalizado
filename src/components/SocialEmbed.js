"use client";

import { useEffect, useState } from 'react';

export default function SocialEmbed({ url, platform }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px' }} />;

    if (!url) return null;

    try {
        if (platform === 'INSTAGRAM') {
            // Extrair ID do post do Instagram
            // Ex: https://www.instagram.com/p/C-abcdefg/
            const match = url.match(/\/p\/([a-zA-Z0-9_-]+)/);
            const postId = match ? match[1] : null;

            if (postId) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                        <iframe
                            src={`https://www.instagram.com/p/${postId}/embed`}
                            width="328"
                            height="400"
                            frameBorder="0"
                            scrolling="no"
                            allowtransparency="true"
                            style={{ maxWidth: '100%' }}
                        ></iframe>
                    </div>
                );
            }
        }

        if (platform === 'FACEBOOK') {
            // Usar plugin de página ou post do Facebook (simplificado)
            const encodedUrl = encodeURIComponent(url);
            return (
                <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                    <iframe
                        src={`https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500`}
                        width="500"
                        height="400"
                        style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    ></iframe>
                </div>
            );
        }

        if (platform === 'PINTEREST') {
            // Pinterest Widget Builder logic or simple link fallback for now as iframe is tricky without script
            // Tentativa de iframe simples se possível, senão fallback
            const match = url.match(/\/pin\/(\d+)/);
            const pinId = match ? match[1] : null;

            if (pinId) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <iframe
                            src={`https://assets.pinterest.com/ext/embed.html?id=${pinId}`}
                            height="400"
                            width="345"
                            frameBorder="0"
                            scrolling="no"
                        ></iframe>
                    </div>
                );
            }
        }

        return (
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ marginBottom: '0.5rem' }}>Visualização não disponível no admin.</p>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}>
                    Ver post original no {platform} 🔗
                </a>
            </div>
        );
    } catch (error) {
        return (
            <div style={{ padding: '1rem', color: 'red' }}>
                Erro ao carregar post. <a href={url} target="_blank">Ver link</a>
            </div>
        );
    }
}
