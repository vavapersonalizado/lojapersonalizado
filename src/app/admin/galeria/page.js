"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';

export default function GaleriaPage() {
    const [selectedAssets, setSelectedAssets] = useState([]);

    const openMediaLibrary = () => {
        // Open Cloudinary Media Library
        if (window.cloudinary) {
            window.cloudinary.openMediaLibrary({
                cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
                multiple: true,
                max_files: 50
            }, {
                insertHandler: (data) => {
                    const assets = data.assets.map(asset => ({
                        url: asset.secure_url,
                        publicId: asset.public_id,
                        format: asset.format,
                        resourceType: asset.resource_type
                    }));
                    setSelectedAssets(assets);
                }
            });
        }
    };

    return (
        <div style={{ maxWidth: '1400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Galeria de Mídia</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <CldUploadWidget
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        onSuccess={(result) => {
                            console.log('Upload success:', result);
                        }}
                        options={{
                            sources: ['local', 'url', 'camera'],
                            multiple: true,
                            maxFiles: 20,
                            resourceType: "auto",
                            clientAllowedFormats: ["image", "video", "glb", "gltf"],
                            maxFileSize: 50000000,
                            googleApiKey: null,
                        }}
                    >
                        {({ open }) => (
                            <button
                                onClick={() => open()}
                                className="btn btn-primary"
                            >
                                📤 Fazer Upload
                            </button>
                        )}
                    </CldUploadWidget>

                    <button
                        onClick={openMediaLibrary}
                        className="btn btn-outline"
                    >
                        🖼️ Abrir Biblioteca
                    </button>
                </div>
            </div>

            <div style={{
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '2rem',
                minHeight: '400px',
                background: 'var(--muted)'
            }}>
                {selectedAssets.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '400px',
                        color: 'var(--muted-foreground)',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</p>
                        <h3>Nenhum arquivo selecionado</h3>
                        <p>Clique em "Abrir Biblioteca" para navegar pelos arquivos do Cloudinary</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
                            Ou faça upload de novos arquivos
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {selectedAssets.map((asset, index) => (
                            <div key={index} style={{
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                overflow: 'hidden',
                                background: 'white'
                            }}>
                                {asset.resourceType === 'video' ? (
                                    <video
                                        src={asset.url}
                                        controls
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <img
                                        src={asset.url}
                                        alt={asset.publicId}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <div style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                                    <p style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {asset.publicId}
                                    </p>
                                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>
                                        {asset.format?.toUpperCase()} • {asset.resourceType}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedAssets.length > 0 && (
                <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    {selectedAssets.length} arquivo(s) selecionado(s)
                </div>
            )}

            {/* Load Cloudinary Media Library Script */}
            <script
                src="https://media-library.cloudinary.com/global/all.js"
                async
            />
        </div>
    );
}
