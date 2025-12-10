"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { generatePrintFile } from '@/lib/printFile';

export default function CustomProductPage() {
    const params = useParams();
    const { id } = params;
    const router = useRouter();
    const { addToCart } = useCart();
    const { t } = useLanguage();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stickers, setStickers] = useState([]);

    // Canvas State
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [elements, setElements] = useState([]); // { type: 'image' | 'text', x, y, content, color, scale }
    const [selectedElement, setSelectedElement] = useState(null);

    // Inputs
    const [textInput, setTextInput] = useState('');
    const [textColor, setTextColor] = useState('#000000');
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Fetch Product
        fetch(`/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        // Fetch Stickers (Products in 'Adesivos' category)
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                const stickerProducts = data.filter(p => p.category?.name?.toLowerCase().includes('adesivo'));
                setStickers(stickerProducts);
            });
    }, [id]);

    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            setCtx(context);
        }
    }, [loading]);

    useEffect(() => {
        if (ctx && product) {
            drawCanvas();
        }
    }, [ctx, elements, product]);

    const drawCanvas = () => {
        if (!ctx || !canvasRef.current) return;

        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Product Background
        if (product.images && product.images.length > 0) {
            const img = new Image();
            img.src = product.images[0];
            img.onload = () => {
                // Center image and fit to canvas
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Draw Elements on top
                drawElements();
            };
        } else {
            drawElements();
        }
    };

    const drawElements = () => {
        elements.forEach(el => {
            if (el.type === 'text') {
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = el.color;
                ctx.fillText(el.content, el.x, el.y);
            } else if (el.type === 'image') {
                const img = new Image();
                img.src = el.content;
                // img.onload is tricky inside render loop, assume loaded or handle async
                // For simplicity in this prototype, we might flicker or need preloading.
                // Better: Draw immediately if cached.
                ctx.drawImage(img, el.x, el.y, 100 * (el.scale || 1), 100 * (el.scale || 1));
            }
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setElements([...elements, {
                        type: 'image',
                        content: event.target.result,
                        x: 150,
                        y: 150,
                        scale: 1,
                        id: Date.now()
                    }]);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const addText = () => {
        if (!textInput.trim()) return;
        setElements([...elements, {
            type: 'text',
            content: textInput,
            color: textColor,
            x: 150,
            y: 150,
            id: Date.now()
        }]);
        setTextInput('');
    };

    const addSticker = (stickerUrl) => {
        setElements([...elements, {
            type: 'image',
            content: stickerUrl,
            x: 150,
            y: 150,
            scale: 1,
            id: Date.now()
        }]);
    };

    // Simple Dragging Logic (Mouse Events)
    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find clicked element (reverse to find top-most)
        const clicked = [...elements].reverse().find(el => {
            if (el.type === 'text') {
                // Approx text hit detection
                return x >= el.x && x <= el.x + 100 && y >= el.y - 24 && y <= el.y;
            } else {
                return x >= el.x && x <= el.x + 100 && y >= el.y && y <= el.y + 100;
            }
        });

        if (clicked) {
            setSelectedElement(clicked);
            setIsDragging(true);
            setDragStart({ x: x - clicked.x, y: y - clicked.y });
        } else {
            setSelectedElement(null);
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && selectedElement) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const updatedElements = elements.map(el =>
                el.id === selectedElement.id
                    ? { ...el, x: x - dragStart.x, y: y - dragStart.y }
                    : el
            );
            setElements(updatedElements);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleAddToCart = () => {
        if (!canvasRef.current) return;

        // Generate preview image (normal resolution)
        const dataUrl = canvasRef.current.toDataURL('image/png');

        // Generate print-ready file (300 DPI)
        const printFile = generatePrintFile(canvasRef.current, {
            width: 10, // Default 10cm - pode ser configurado por produto
            height: 10,
            name: product.name,
            dpi: 300
        });

        addToCart(product, 1, {
            preview: dataUrl,
            elements: elements,
            printFile: printFile // Arquivo pronto para impressão
        });

        router.push('/cart');
    };

    if (loading) return <div>Carregando...</div>;
    if (!product) return <div>Produto não encontrado</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Personalizar: {product.name}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Canvas Area */}
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', background: '#f9f9f9' }}>
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={600}
                        style={{ width: '100%', height: 'auto', cursor: isDragging ? 'grabbing' : 'grab' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Upload Image */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📸 Sua Foto</h3>
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                    </div>

                    {/* Add Text */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>✍️ Adicionar Texto</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Digite aqui..."
                                style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                style={{ width: '40px', height: '40px', padding: 0, border: 'none' }}
                            />
                        </div>
                        <button onClick={addText} className="btn btn-secondary" style={{ width: '100%' }}>Adicionar Texto</button>
                    </div>

                    {/* Stickers */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>⭐ Adesivos</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                            {stickers.map(sticker => (
                                <div
                                    key={sticker.id}
                                    onClick={() => addSticker(sticker.images[0])}
                                    style={{ cursor: 'pointer', border: '1px solid #eee', padding: '0.25rem', borderRadius: '4px' }}
                                >
                                    <img src={sticker.images[0]} alt={sticker.name} style={{ width: '100%', height: 'auto' }} />
                                </div>
                            ))}
                            {stickers.length === 0 && <p style={{ color: '#000000', gridColumn: 'span 3' }}>Nenhum adesivo encontrado.</p>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto' }}>
                        <button
                            onClick={handleAddToCart}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
                        >
                            Concluir e Adicionar ao Carrinho
                        </button>
                        <button
                            onClick={() => setElements([])}
                            className="btn btn-outline"
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            Limpar Tudo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
