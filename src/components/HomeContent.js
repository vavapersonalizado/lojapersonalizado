"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import OnlineCounter from '@/components/OnlineCounter';
import SocialEmbed from '@/components/SocialEmbed';

export default function HomeContent() {
    const { data: session } = useSession();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blogPosts, setBlogPosts] = useState([]);
    const [showBlog, setShowBlog] = useState(false);

    useEffect(() => {
        // Fetch products
        fetch('/api/products')
            .then(res => {
                if (!res.ok) throw new Error('Erro ao buscar produtos');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error('Formato de dados inválido:', data);
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro:', err);
                setProducts([]);
                setLoading(false);
            });

        // Fetch settings and blog
        fetch('/api/settings')
            .then(res => res.json())
            .then(settings => {
                if (settings && settings.showBlog) {
                    setShowBlog(true);
                    return fetch('/api/blog?limit=6');
                }
                return null;
            })
            .then(res => {
                if (res) return res.json();
                return null;
            })
            .then(data => {
                if (data && data.posts) {
                    setBlogPosts(data.posts);
                }
            })
            .catch(err => console.error('Error fetching blog/settings:', err));
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* Hero Moderno */}
            <section style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'var(--card)',
                backdropFilter: 'blur(12px)',
                border: 'var(--glass-border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)',
                boxShadow: 'var(--shadow-glow)',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '1rem'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800'
                    }}>
                        Vanessa Yachiro
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        marginBottom: '2rem',
                        opacity: 0.9,
                        fontFamily: 'Outfit, sans-serif',
                        maxWidth: '600px',
                        margin: '0 auto 2rem auto',
                        lineHeight: '1.6'
                    }}>
                        Personalizados exclusivos feitos com carinho e qualidade premium. Transforme suas ideias em presentes inesquecíveis.
                    </p>

                    {/* Online Counter */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <OnlineCounter />
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="animate-float" style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-5%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                    opacity: 0.2,
                    filter: 'blur(40px)'
                }} />
                <div className="animate-float" style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-5%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)',
                    opacity: 0.2,
                    filter: 'blur(40px)',
                    animationDelay: '2s'
                }} />
            </section>

            {/* Product Grid */}
            <main className="container" style={{ padding: '0', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--foreground)' }}>Destaques</h2>
                    <Link href="/products" className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        Ver Todos →
                    </Link>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div className="animate-spin" style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid var(--muted)',
                            borderTopColor: 'var(--primary)',
                            borderRadius: '50%'
                        }} />
                    </div>
                ) : products.length === 0 ? (
                    <div className="glass" style={{ textAlign: 'center', padding: '4rem', borderRadius: 'var(--radius)' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Nenhum produto cadastrado ainda.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '2rem'
                    }}>
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} isClientMode={true} />
                        ))}
                    </div>
                )}
            </main>

            {/* Social Blog Section */}
            {
                showBlog && blogPosts.length > 0 && (
                    <section className="container" style={{ padding: '0', marginBottom: '2rem' }}>
                        <h2 style={{
                            textAlign: 'center',
                            marginBottom: '2rem',
                            fontSize: '2rem',
                            color: 'var(--foreground)',
                            fontFamily: 'Outfit, sans-serif'
                        }}>
                            Siga-nos nas Redes Sociais
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            {blogPosts.map(post => (
                                <div key={post.id} className="card glass" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {post.platform}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <SocialEmbed url={post.embedUrl} platform={post.platform} />
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }

            {/* Footer */}
            <footer style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                borderTop: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
                background: 'rgba(0,0,0,0.2)',
                marginTop: 'auto'
            }}>
                <p>&copy; 2025 Vanessa Yachiro Personalizados. Todos os direitos reservados.</p>
            </footer>
        </div >
    );
}
