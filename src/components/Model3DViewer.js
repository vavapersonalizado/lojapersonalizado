"use client";

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, PresentationControls } from '@react-three/drei';
import { useState } from 'react';

function Model({ url, modelType }) {
    // Load the 3D model based on type
    const { scene } = useGLTF(url);

    return <primitive object={scene} />;
}

function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#667eea" wireframe />
        </mesh>
    );
}

export default function Model3DViewer({
    modelUrl,
    modelType = 'glb',
    autoRotate = false,
    showControls = true,
    fallbackImage = null,
    height = '500px'
}) {
    const [error, setError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!modelUrl || error) {
        if (fallbackImage) {
            return (
                <div style={{ width: '100%', height, position: 'relative' }}>
                    <img
                        src={fallbackImage}
                        alt="Product"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </div>
            );
        }
        return (
            <div style={{
                width: '100%',
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5',
                borderRadius: 'var(--radius)',
                color: '#666'
            }}>
                {error ? '❌ Erro ao carregar modelo 3D' : '📦 Modelo 3D não disponível'}
            </div>
        );
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div style={{
            width: '100%',
            height: isFullscreen ? '100vh' : height,
            position: isFullscreen ? 'fixed' : 'relative',
            top: isFullscreen ? 0 : 'auto',
            left: isFullscreen ? 0 : 'auto',
            zIndex: isFullscreen ? 9999 : 1,
            background: isFullscreen ? '#000' : '#f0f0f0',
            borderRadius: isFullscreen ? 0 : 'var(--radius)',
            overflow: 'hidden'
        }}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                style={{ width: '100%', height: '100%' }}
                onError={() => setError(true)}
            >
                <Suspense fallback={<LoadingFallback />}>
                    <Stage environment="city" intensity={0.6}>
                        <Model url={modelUrl} modelType={modelType} />
                    </Stage>
                </Suspense>

                {showControls && (
                    <OrbitControls
                        autoRotate={autoRotate}
                        autoRotateSpeed={2}
                        enableZoom={true}
                        enablePan={true}
                        minDistance={2}
                        maxDistance={10}
                    />
                )}
            </Canvas>

            {/* Controls Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                display: 'flex',
                gap: '0.5rem',
                zIndex: 10
            }}>
                <button
                    onClick={toggleFullscreen}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        backdropFilter: 'blur(10px)'
                    }}
                    title={isFullscreen ? "Sair do fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? '🗙' : '⛶'} {isFullscreen ? 'Fechar' : 'Fullscreen'}
                </button>
            </div>

            {/* Instructions */}
            {!isFullscreen && (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.8rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    🖱️ Arraste para rotacionar • 🔍 Scroll para zoom
                </div>
            )}
        </div>
    );
}
