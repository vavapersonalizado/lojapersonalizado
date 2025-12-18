"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { generatePrintFile } from '@/lib/printFile';
import { dynamicIcons } from '@/lib/dynamicIcons';

export default function CustomProductPage() {
    const params = useParams();
    const { id } = params;
    const router = useRouter();
    const { addToCart } = useCart();
    const { t } = useLanguage();

    useEffect(() => {
        // Load Google Fonts
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Bangers&family=Lobster&family=Open+Sans:wght@400;700&family=Pacifico&family=Roboto:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stickers, setStickers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Dynamic Icons State
    const [visibleIconCategories, setVisibleIconCategories] = useState(['shapes']); // Default category
    const [selectedIcons, setSelectedIcons] = useState([]); // Array of icon objects to add

    // Canvas State
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    // elements: { type, x, y, content, color, scale, side: 'front'|'back', svgString? }
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [currentSide, setCurrentSide] = useState('front'); // 'front' | 'back'

    // UI State
    const [activeTab, setActiveTab] = useState('text'); // 'text', 'upload', 'stickers', 'icons', 'layers'
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Tool Inputs
    const [textInput, setTextInput] = useState('');
    const [textColor, setTextColor] = useState('#000000');
    const [selectedFont, setSelectedFont] = useState('Arial');
    const [urlInput, setUrlInput] = useState('');

    const fontOptions = [
        { name: 'Arial', value: 'Arial' },
        { name: 'Times New Roman', value: 'Times New Roman' },
        { name: 'Courier New', value: 'Courier New' },
        { name: 'Roboto', value: 'Roboto' },
        { name: 'Open Sans', value: 'Open Sans' },
        { name: 'Pacifico', value: 'Pacifico' },
        { name: 'Bangers', value: 'Bangers' },
        { name: 'Lobster', value: 'Lobster' },
    ];

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

        // Fetch Categories
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
            })
            .catch(err => console.error('Error fetching categories:', err));
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
    }, [ctx, elements, product, currentSide, selectedElement]);

    const drawCanvas = () => {
        if (!ctx || !canvasRef.current) return;

        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Product Background (Front or Back)
        if (product.images && product.images.length > 0) {
            const imgIndex = currentSide === 'front' ? 0 : (product.images.length > 1 ? 1 : 0);
            const img = new Image();
            img.src = product.images[imgIndex];
            img.onload = () => {
                // Center image and fit to canvas
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // 2. Draw Japanese Standard Guide (Print Area)
                const guideWidth = canvas.width * 0.5;
                const guideHeight = canvas.height * 0.6;
                const guideX = (canvas.width - guideWidth) / 2;
                const guideY = (canvas.height - guideHeight) / 2;

                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.lineWidth = 2;
                ctx.setLineDash([10, 10]);
                ctx.strokeRect(guideX, guideY, guideWidth, guideHeight);
                ctx.setLineDash([]);

                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.font = '12px Arial';
                ctx.fillText('Área de Impressão (Padrão Japonês)', guideX + 5, guideY + 20);

                // 3. Draw Elements for current side
                drawElements();
            };
        } else {
            drawElements();
        }
    };

    const drawElements = () => {
        const sideElements = elements.filter(el => el.side === currentSide);

        sideElements.forEach(el => {
            if (el.type === 'text') {
                const fontSize = el.fontSize || 24;
                const fontFamily = el.fontFamily || 'Arial';
                ctx.font = `bold ${fontSize}px "${fontFamily}"`;
                ctx.fillStyle = el.color;
                ctx.fillText(el.content, el.x, el.y);

                if (selectedElement && selectedElement.id === el.id) {
                    const metrics = ctx.measureText(el.content);
                    const width = metrics.width;
                    const height = fontSize;
                    ctx.strokeStyle = '#7c3aed';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(el.x - 5, el.y - height + 5, width + 10, height + 10);
                    ctx.setLineDash([]);
                }

            } else if (el.type === 'image') {
                const img = new Image();
                img.src = el.content;
                const scale = el.scale || 1;
                const width = 100 * scale;
                const height = 100 * scale;

                ctx.drawImage(img, el.x, el.y, width, height);

                if (selectedElement && selectedElement.id === el.id) {
                    ctx.strokeStyle = '#7c3aed';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(el.x - 2, el.y - 2, width + 4, height + 4);
                    ctx.setLineDash([]);
                }
            } else if (el.type === 'svg') {
                // Render SVG
                const img = new Image();
                // Replace currentColor with actual color
                const coloredSvg = el.svgString.replace(/currentColor/g, el.color || '#000000');
                const svgBlob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    const scale = el.scale || 1;
                    const width = 100 * scale;
                    const height = 100 * scale;
                    ctx.drawImage(img, el.x, el.y, width, height);
                    URL.revokeObjectURL(url); // Clean up

                    if (selectedElement && selectedElement.id === el.id) {
                        ctx.strokeStyle = '#7c3aed';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 5]);
                        ctx.strokeRect(el.x - 2, el.y - 2, width + 4, height + 4);
                        ctx.setLineDash([]);
                    }
                };
                img.src = url;
            }
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert("O arquivo é muito grande! O limite é 10MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setElements([...elements, {
                        type: 'image',
                        content: event.target.result,
                        x: 250, y: 250, scale: 1, side: currentSide, id: Date.now()
                    }]);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlUpload = () => {
        if (!urlInput.trim()) return;
        const img = new Image();
        img.onload = () => {
            setElements([...elements, {
                type: 'image', content: urlInput, x: 250, y: 250, scale: 1, side: currentSide, id: Date.now()
            }]);
            setUrlInput('');
        };
        img.onerror = () => alert("Não foi possível carregar a imagem. Verifique o link.");
        img.crossOrigin = "Anonymous";
        img.src = urlInput;
    };

    const addText = () => {
        if (!textInput.trim()) return;
        setElements([...elements, {
            type: 'text', content: textInput, color: textColor, fontFamily: selectedFont, fontSize: 30, x: 250, y: 250, side: currentSide, id: Date.now()
        }]);
        setTextInput('');
    };

    const addSticker = (stickerUrl) => {
        setElements([...elements, {
            type: 'image', content: stickerUrl, x: 250, y: 250, scale: 1, side: currentSide, id: Date.now()
        }]);
    };

    // Dynamic Icons Logic
    const toggleIconSelection = (icon) => {
        if (selectedIcons.find(i => i.id === icon.id)) {
            setSelectedIcons(selectedIcons.filter(i => i.id !== icon.id));
        } else {
            setSelectedIcons([...selectedIcons, icon]);
        }
    };

    const addSelectedIcons = () => {
        const newElements = selectedIcons.map((icon, index) => ({
            type: 'svg',
            svgString: icon.svg,
            color: '#000000', // Default color
            x: 250 + (index * 20), // Offset slightly
            y: 250 + (index * 20),
            scale: 1,
            side: currentSide,
            id: Date.now() + index
        }));
        setElements([...elements, ...newElements]);
        setSelectedIcons([]); // Clear selection
    };

    const addIconCategory = (categoryKey) => {
        if (!visibleIconCategories.includes(categoryKey)) {
            setVisibleIconCategories([...visibleIconCategories, categoryKey]);
        }
    };

    const removeIconCategory = (categoryKey) => {
        setVisibleIconCategories(visibleIconCategories.filter(c => c !== categoryKey));
    };

    // Simple Dragging Logic (Mouse Events)
    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const sideElements = elements.filter(el => el.side === currentSide);
        const clicked = [...sideElements].reverse().find(el => {
            if (el.type === 'text') {
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

    const prepareCartItem = () => {
        if (!canvasRef.current) return null;
        const previewUrl = canvasRef.current.toDataURL('image/png');
        const printFile = generatePrintFile(canvasRef.current, {
            width: product.printWidth || 30,
            height: product.printHeight || 40,
            name: `${product.name} - ${currentSide}`,
            dpi: 300
        });
        return {
            preview: previewUrl,
            elements: elements,
            printFile: printFile,
            side: currentSide
        };
    };

    const handleAddToCartAndStay = () => {
        const customization = prepareCartItem();
        if (!customization) return;
        addToCart(product, 1, customization);
        alert("Produto adicionado ao carrinho! Você pode continuar editando.");
    };

    const handleAddToCartAndGo = () => {
        const customization = prepareCartItem();
        if (!customization) return;
        addToCart(product, 1, customization);
        router.push('/cart');
    };

    const handleBuyNow = () => {
        const customization = prepareCartItem();
        if (!customization) return;
        addToCart(product, 1, customization);
        router.push('/checkout');
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Carregando...</div>;
    if (!product) return <div style={{ textAlign: 'center', padding: '4rem' }}>Produto não encontrado</div>;

    const filteredStickers = selectedCategory === 'all'
        ? stickers
        : stickers.filter(s => s.categoryId === selectedCategory);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', minHeight: '80vh' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Estúdio de Criação: {product.name}
                </h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleAddToCartAndStay} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>Adicionar (+)</button>
                    <button onClick={handleAddToCartAndGo} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>Finalizar Edição</button>
                    <button onClick={handleBuyNow} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', background: '#16a34a', borderColor: '#16a34a' }}>Comprar Agora</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>

                {/* Canvas Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button onClick={() => setCurrentSide('front')} style={{ padding: '0.5rem 2rem', borderRadius: '20px', border: 'none', background: currentSide === 'front' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>FRENTE</button>
                        <button onClick={() => setCurrentSide('back')} style={{ padding: '0.5rem 2rem', borderRadius: '20px', border: 'none', background: currentSide === 'back' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>VERSO</button>
                    </div>

                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.2)', minHeight: '600px', position: 'relative' }}>
                        <canvas ref={canvasRef} width={600} height={600} style={{ maxWidth: '100%', height: 'auto', cursor: isDragging ? 'grabbing' : 'grab', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', borderRadius: '4px', background: '#fff' }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
                        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: 'white' }}>Guia: Padrão Japonês (30x40cm)</div>
                    </div>
                </div>

                {/* Tools Sidebar */}
                <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                        {[
                            { id: 'text', icon: '✍️', label: 'Texto' },
                            { id: 'upload', icon: '📸', label: 'Upload' },
                            { id: 'stickers', icon: '⭐', label: 'Adesivos' },
                            { id: 'icons', icon: '🎨', label: 'Ícones' },
                            { id: 'layers', icon: '📚', label: 'Camadas' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '1rem 0.5rem', background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600' }}>
                                <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>

                        {activeTab === 'text' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Digite seu texto</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Ex: Feliz Aniversário!" style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '45px', height: '45px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Escolha a Fonte</label>
                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                        {fontOptions.map(f => (
                                            <button key={f.value} onClick={() => setSelectedFont(f.value)} style={{ padding: '0.75rem', textAlign: 'left', fontFamily: f.value, fontSize: '1.1rem', background: selectedFont === f.value ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.05)', border: selectedFont === f.value ? '1px solid var(--primary)' : '1px solid transparent', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>{f.name}</button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={addText} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Adicionar Texto</button>
                            </div>
                        )}

                        {activeTab === 'upload' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Do seu dispositivo</h3>
                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                                        <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</span>
                                        <span style={{ fontSize: '0.9rem' }}>Clique para enviar imagem</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Máx: 10MB (PNG/JPG)</span>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                    </label>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Da Internet (Link)</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://exemplo.com/imagem.png" style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                        <button onClick={handleUrlUpload} className="btn btn-secondary" style={{ padding: '0 1rem' }}>Add</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stickers' && (
                            <div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                                        <option value="all">Todas as Categorias</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                    {filteredStickers.map(sticker => (
                                        <div key={sticker.id} onClick={() => addSticker(sticker.images[0])} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={sticker.images[0]} alt={sticker.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'icons' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Add Category Button */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Adicionar Categoria</label>
                                    <select
                                        onChange={(e) => addIconCategory(e.target.value)}
                                        value=""
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                    >
                                        <option value="" disabled>Escolha uma categoria...</option>
                                        {Object.entries(dynamicIcons).map(([key, cat]) => (
                                            <option key={key} value={key}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Visible Categories Sections */}
                                {visibleIconCategories.map(catKey => {
                                    const category = dynamicIcons[catKey];
                                    if (!category) return null;
                                    return (
                                        <div key={catKey} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{category.name}</h3>
                                                <button onClick={() => removeIconCategory(catKey)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>✕</button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                                {category.icons.map(icon => {
                                                    const isSelected = selectedIcons.find(i => i.id === icon.id);
                                                    return (
                                                        <div
                                                            key={icon.id}
                                                            onClick={() => toggleIconSelection(icon)}
                                                            style={{
                                                                position: 'relative',
                                                                cursor: 'pointer',
                                                                background: isSelected ? 'rgba(124, 58, 237, 0.3)' : 'rgba(255,255,255,0.1)',
                                                                padding: '0.5rem',
                                                                borderRadius: '4px',
                                                                aspectRatio: '1/1',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: isSelected ? '2px solid var(--primary)' : '2px solid transparent'
                                                            }}
                                                        >
                                                            {/* Render SVG Preview */}
                                                            <div
                                                                style={{ width: '100%', height: '100%', color: 'white' }}
                                                                dangerouslySetInnerHTML={{ __html: icon.svg }}
                                                            />
                                                            {/* Checkbox Overlay */}
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '2px',
                                                                right: '2px',
                                                                width: '14px',
                                                                height: '14px',
                                                                borderRadius: '2px',
                                                                background: isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.5)',
                                                                border: '1px solid white',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '10px', color: 'white'
                                                            }}>
                                                                {isSelected && '✓'}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {selectedIcons.length > 0 && (
                                    <button
                                        onClick={addSelectedIcons}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '0.75rem', position: 'sticky', bottom: 0 }}
                                    >
                                        Adicionar Selecionados ({selectedIcons.length})
                                    </button>
                                )}
                            </div>
                        )}

                        {activeTab === 'layers' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {elements.filter(el => el.side === currentSide).length === 0 && <p style={{ color: 'var(--muted-foreground)', textAlign: 'center' }}>Nenhuma camada nesta face.</p>}
                                {[...elements].filter(el => el.side === currentSide).reverse().map((el, index) => (
                                    <div key={el.id} onClick={() => setSelectedElement(el)} style={{ padding: '0.75rem', background: selectedElement?.id === el.id ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.05)', border: selectedElement?.id === el.id ? '1px solid var(--primary)' : '1px solid transparent', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>{el.type === 'text' ? 'T' : (el.type === 'svg' ? '🎨' : '🖼️')}</span>
                                            <span style={{ fontSize: '0.9rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {el.type === 'text' ? el.content : (el.type === 'svg' ? 'Ícone' : 'Imagem')}
                                            </span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setElements(elements.filter(item => item.id !== el.id)); if (selectedElement?.id === el.id) setSelectedElement(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>🗑️</button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {selectedElement && (
                        <div style={{ padding: '1rem', background: 'rgba(124, 58, 237, 0.1)', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>EDITANDO SELEÇÃO</span>
                                <button onClick={() => setSelectedElement(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                            </div>

                            {selectedElement.type === 'text' && (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.7rem', display: 'block' }}>Tamanho</label>
                                        <input type="range" min="10" max="100" value={selectedElement.fontSize || 24} onChange={e => { const val = parseInt(e.target.value); setElements(elements.map(el => el.id === selectedElement.id ? { ...el, fontSize: val } : el)); setSelectedElement({ ...selectedElement, fontSize: val }); }} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', display: 'block' }}>Cor</label>
                                        <input type="color" value={selectedElement.color} onChange={e => { setElements(elements.map(el => el.id === selectedElement.id ? { ...el, color: e.target.value } : el)); setSelectedElement({ ...selectedElement, color: e.target.value }); }} style={{ width: '30px', height: '30px', padding: 0, border: 'none' }} />
                                    </div>
                                </div>
                            )}

                            {(selectedElement.type === 'image' || selectedElement.type === 'svg') && (
                                <div>
                                    <label style={{ fontSize: '0.7rem', display: 'block' }}>Escala ({selectedElement.scale || 1}x)</label>
                                    <input type="range" min="0.1" max="3.0" step="0.1" value={selectedElement.scale || 1} onChange={e => { const val = parseFloat(e.target.value); setElements(elements.map(el => el.id === selectedElement.id ? { ...el, scale: val } : el)); setSelectedElement({ ...selectedElement, scale: val }); }} style={{ width: '100%' }} />

                                    {selectedElement.type === 'svg' && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <label style={{ fontSize: '0.7rem', display: 'block' }}>Cor do Ícone</label>
                                            <input type="color" value={selectedElement.color || '#000000'} onChange={e => { setElements(elements.map(el => el.id === selectedElement.id ? { ...el, color: e.target.value } : el)); setSelectedElement({ ...selectedElement, color: e.target.value }); }} style={{ width: '100%', height: '30px', padding: 0, border: 'none' }} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
