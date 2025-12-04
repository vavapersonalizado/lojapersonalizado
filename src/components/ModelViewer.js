"use client";

import { useEffect } from 'react';

export default function ModelViewer({ src, poster, alt, style }) {
    useEffect(() => {
        import('@google/model-viewer').catch(console.error);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', ...style }}>
            <model-viewer
                src={src}
                poster={poster}
                alt={alt || "Modelo 3D"}
                auto-rotate
                camera-controls
                ar
                ar-modes="webxr scene-viewer quick-look"
                shadow-intensity="1"
                style={{ width: '100%', height: '100%' }}
            >
                <div slot="progress-bar"></div>
            </model-viewer>
        </div>
    );
}
