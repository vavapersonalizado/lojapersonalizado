"use client";

import { CldUploadWidget } from 'next-cloudinary';

export default function ImageUpload({ onUpload }) {
    return (
        <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={(result) => {
                if (result.info?.secure_url) {
                    const isVideo = result.info.resource_type === 'video';
                    onUpload(result.info.secure_url, isVideo ? 'video' : 'image');
                }
            }}
            options={{
                sources: ['local', 'url', 'camera'],
                multiple: false,
                maxFiles: 1,
                resourceType: "auto",
                clientAllowedFormats: ["image", "video", "glb", "gltf"],
                maxFileSize: 50000000, // 50MB
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
                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☁️📷🎥</p>
                            <p>Clique para fazer upload (Cloudinary)</p>
                        </div>
                    </div>
                );
            }}
        </CldUploadWidget>
    );
}
