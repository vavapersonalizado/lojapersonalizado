"use client";

import { useState, useRef } from 'react';

export default function ImageUpload({ onUpload }) {
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setUploading(true);

        try {
            const response = await fetch(`/api/upload?filename=${file.name}`, {
                method: 'POST',
                body: file,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const newBlob = await response.json();
            onUpload(newBlob.url); // Pass the public URL back to parent
            setUploading(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Erro no upload da imagem');
            setUploading(false);
            setPreview(null);
        }
    };

    return (
        <div
            style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius)',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: preview ? `url(${preview}) center/cover no-repeat` : 'var(--muted)',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />

            {uploading && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                    Enviando...
                </div>
            )}

            {!preview && !uploading && (
                <div style={{ color: 'var(--muted-foreground)' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</p>
                    <p>Clique ou arraste uma imagem aqui</p>
                </div>
            )}
        </div>
    );
}
