"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { useEffect } from 'react';

export default function ImageUpload({ onUpload, currentImage }) {
    useEffect(() => {
        // Load Cloudinary Media Library script
        if (!document.getElementById('cloudinary-media-library')) {
            const script = document.createElement('script');
            script.id = 'cloudinary-media-library';
            script.src = 'https://media-library.cloudinary.com/global/all.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const openMediaLibrary = () => {
        if (window.cloudinary) {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

            window.cloudinary.createMediaLibrary({
                cloud_name: cloudName,
                api_key: apiKey,
                multiple: false, // Single selection for this component
                max_files: 1,
                insert_caption: 'Selecionar',
                default_transformations: [
                    []
                ],
                button_class: "myBtn",
                inline_container: null,
                z_index: 9999
            }, {
                insertHandler: (data) => {
                    if (data.assets && data.assets.length > 0) {
                        const asset = data.assets[0];
                        const isVideo = asset.resource_type === 'video';
                        const is3D = asset.format === 'glb' || asset.format === 'gltf';
                        let type = 'image';
                        if (isVideo) type = 'video';
                        if (is3D) type = '3d';

                        onUpload(asset.secure_url, type);
                    }
                }
            }).show();
        } else {
            alert('Aguarde o carregamento da biblioteca de mídia...');
        }
    };

    return (
        <div style={{ width: '100%' }}>
            <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result) => {
                    if (result.info?.secure_url) {
                        const isVideo = result.info.resource_type === 'video';
                        const is3D = result.info.format === 'glb' || result.info.format === 'gltf';
                        let type = 'image';
                        if (isVideo) type = 'video';
                        if (is3D) type = '3d';

                        onUpload(result.info.secure_url, type);
                    }
                }}
                options={{
                    sources: ['local', 'url', 'camera', 'google_drive', 'dropbox'],
                    showAdvancedOptions: true,
                    cropping: true,
                    multiple: false,
                    defaultSource: "local",
                    maxFiles: 10,
                    resourceType: "auto",
                    clientAllowedFormats: ["image", "video", "glb", "gltf"],
                    maxFileSize: 50000000,
                    googleApiKey: null,
                    styles: {
                        palette: {
                            window: "#FFFFFF",
                            windowBorder: "#90A0B3",
                            tabIcon: "#0078FF",
                            menuIcons: "#5A616A",
                            textDark: "#000000",
                            textLight: "#FFFFFF",
                            link: "#0078FF",
                            action: "#FF620C",
                            inactiveTabIcon: "#0E2F5A",
                            error: "#F44235",
                            inProgress: "#0078FF",
                            complete: "#20B832",
                            sourceBg: "#E4EBF1"
                        }
                    }
                }}
            >
                {({ open }) => {
                    if (currentImage) {
                        return (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '200px',
                                    marginBottom: '1rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={currentImage}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f0f0f0' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="btn btn-outline"
                                        style={{ flex: 1 }}
                                    >
                                        🔄 Alterar Imagem
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onUpload('')}
                                        className="btn btn-outline"
                                        style={{ color: 'red', borderColor: 'red' }}
                                    >
                                        🗑️ Remover
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            style={{
                                border: '2px dashed var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'var(--muted)',
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onClick={() => open()}
                        >
                            <div style={{ color: 'var(--muted-foreground)' }}>
                                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☁️📷🎥📦</p>
                                <p>Clique para fazer upload</p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Imagens, Vídeos ou 3D .glb)</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>
                                    💡 Selecione várias imagens de uma vez!<br />
                                    Aguarde todos os uploads terminarem antes de clicar em "Done"
                                </p>
                            </div>
                        </div>
                    );
                }}
            </CldUploadWidget>

            {!currentImage && (
                <button
                    type="button"
                    onClick={openMediaLibrary}
                    className="btn btn-outline"
                    style={{ marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    🖼️ Selecionar da Galeria (Cloudinary)
                </button>
            )}
        </div>
    );
}
