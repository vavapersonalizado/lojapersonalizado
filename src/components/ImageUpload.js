import { upload } from '@vercel/blob/client';

export default function ImageUpload({ onUpload }) {
    const [preview, setPreview] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 50MB for client uploads is safer, but keep reasonable)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            alert(`Arquivo muito grande! Tamanho máximo: 50MB\nTamanho do arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return;
        }

        // Detect file type
        const isVideo = file.type.startsWith('video/');
        setFileType(isVideo ? 'video' : 'image');

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setUploading(true);

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            });

            onUpload(newBlob.url, isVideo ? 'video' : 'image');
            setUploading(false);
            setPreview(null);
            setFileType(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMsg = error.message || 'Erro desconhecido no upload';
            alert(`Erro no upload: ${errorMsg}\n\nTente novamente.`);
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
