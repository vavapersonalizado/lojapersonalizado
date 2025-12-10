"use client";

import { useEffect, useState } from 'react';
import { InstagramEmbed, FacebookEmbed, PinterestEmbed } from 'react-social-media-embed';

export default function SocialEmbed({ url, platform }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div style={{ height: '400px', background: '#f0f0f0', borderRadius: '8px' }} />;

    try {
        if (platform === 'INSTAGRAM') {
            return (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <InstagramEmbed url={url} width={328} />
                </div>
            );
        }

        if (platform === 'FACEBOOK') {
            return (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <FacebookEmbed url={url} width={550} />
                </div>
            );
        }

        if (platform === 'PINTEREST') {
            return (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PinterestEmbed url={url} width={345} />
                </div>
            );
        }

        return (
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    Ver post original ({platform})
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
