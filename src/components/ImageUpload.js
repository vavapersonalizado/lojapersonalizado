"use client";

import { CldUploadWidget } from 'next-cloudinary';

export default function ImageUpload({ onUpload, currentImage }) {
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
                onQueuesEnd={(result, { widget }) => {
                    widget.close();
                }}
                options={{
                    sources: ['local', 'url', 'camera', 'google_drive', 'dropbox'],
                    showAdvancedOptions: true,
                    cropping: true,
                    multiple: true,
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
                                    Aguarde todos os uploads terminarem antes de clicar em &quot;Done&quot;
                                </p>
                            </div>
                        </div>
                    );
                }}
            </CldUploadWidget>
        </div>
    );
}
