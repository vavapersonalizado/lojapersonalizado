"use client";

import { useState, useRef } from 'react';

export default function ImageUpload({ onUpload }) {
    const [preview, setPreview] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Detect file type
        const isVideo = file.type.startsWith('video/');
        setFileType(isVideo ? 'video' : 'image');

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
            onUpload(newBlob.url, isVideo ? 'video' : 'image'); // Pass URL and type
            setUploading(false);
            setPreview(null);
            setFileType(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Erro no upload');
            setUploading(false);
            setPreview(null);
            setFileType(null);
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
                background: 'var(--muted)',
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
                accept="image/*,video/*"
                style={{ display: 'none' }}
            />

            {uploading && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                    zIndex: 10
                }}>
                    Enviando...
                </div>
            )}

            {preview && fileType === 'image' && (
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}

            {preview && fileType === 'video' && (
                <video src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
            )}

            {!preview && !uploading && (
                <div style={{ color: 'var(--muted-foreground)' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷🎥</p>
                    <p>Clique ou arraste imagem/vídeo aqui</p>
                </div>
            )}
        </div>
    );
}
