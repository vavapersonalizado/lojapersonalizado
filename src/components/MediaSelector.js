"use client";

import { useEffect } from 'react';

export default function MediaSelector({ onSelect, buttonText = "Selecionar da Galeria" }) {
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

            window.cloudinary.createMediaLibrary({
                cloud_name: cloudName,
                api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
                multiple: true,
                max_files: 10,
                insert_caption: 'Selecionar'
            }, {
                insertHandler: (data) => {
                    data.assets.forEach(asset => {
                        const isVideo = asset.resource_type === 'video';
                        const is3D = asset.format === 'glb' || asset.format === 'gltf';
                        let type = 'image';
                        if (isVideo) type = 'video';
                        if (is3D) type = '3d';

                        onSelect(asset.secure_url, type);
                    });
                }
            }).show();
        } else {
            alert('Aguarde o carregamento da biblioteca de mídia...');
        }
    };

    return (
        <button
            type="button"
            onClick={openMediaLibrary}
            className="btn btn-outline"
            style={{ width: '100%' }}
        >
            🖼️ {buttonText}
        </button>
    );
}
