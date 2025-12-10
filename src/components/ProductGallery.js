"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('./ModelViewer'), { ssr: false });

export default function ProductGallery({ images = [], name }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Filter valid media
    const mediaItems = images && images.length > 0 ? images : [];

    // If no images, show placeholder
    if (mediaItems.length === 0) {
        return (
            <div style={{
                width: '100%',
                aspectRatio: '1',
                background: 'var(--muted)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000'
            }}>
                Sem imagem
            </div>
        );
    }

    const selectedMedia = mediaItems[selectedIndex];

    // Helper to determine media type
    const getMediaType = (item) => {
        if (typeof item === 'object') return item.type; // { url, type }
        if (item.endsWith('.glb') || item.endsWith('.gltf')) return '3d';
        if (item.endsWith('.mp4') || item.endsWith('.webm')) return 'video';
        return 'image';
    };

    const getMediaUrl = (item) => {
        return typeof item === 'object' ? item.url : item;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Main Viewer */}
            <div style={{
                width: '100%',
                aspectRatio: '1',
                background: '#f5f5f5', // Light background for 3D models
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--border)'
            }}>
                {getMediaType(selectedMedia) === '3d' ? (
                    <ModelViewer
                        src={getMediaUrl(selectedMedia)}
                        alt={name}
                        style={{ width: '100%', height: '100%' }}
                    />
                ) : getMediaType(selectedMedia) === 'video' ? (
                    <video
                        src={getMediaUrl(selectedMedia)}
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                ) : (
                    <img
                        src={getMediaUrl(selectedMedia)}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                )}
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 1 && (
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem'
                }}>
                    {mediaItems.map((item, index) => {
                        const type = getMediaType(item);
                        const url = getMediaUrl(item);
                        const isSelected = index === selectedIndex;

                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    flexShrink: 0,
                                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    padding: 0,
                                    background: 'var(--muted)',
                                    position: 'relative'
                                }}
                            >
                                {type === '3d' ? (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                    }}>
                                        🧊
                                    </div>
                                ) : type === 'video' ? (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                    }}>
                                        ▶️
                                    </div>
                                ) : (
                                    <img
                                        src={url}
                                        alt={`${name} thumbnail ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
