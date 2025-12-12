"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SocialEmbed from '@/components/SocialEmbed';

export default function AdminBlogPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUrl, setNewUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showBlog, setShowBlog] = useState(true);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/blog?limit=100');
            const data = await res.json();
            if (data.posts) setPosts(data.posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data && typeof data.showBlog === 'boolean') {
                setShowBlog(data.showBlog);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/');
        if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/');

        if (status === 'authenticated' && session?.user?.role === 'admin') {
            fetchPosts();
            fetchSettings();
        }
    }, [status, session, router]);

    const handleAddPost = async (e) => {
        e.preventDefault();
        if (!newUrl) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embedUrl: newUrl })
            });

            if (res.ok) {
                setNewUrl('');
                fetchPosts();
                alert('Post adicionado com sucesso!');
            } else {
                alert('Erro ao adicionar post');
            }
        } catch (error) {
            console.error('Error adding post:', error);
            alert('Erro ao adicionar post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePost = async (id) => {
        if (!confirm('Tem certeza que deseja remover este post?')) return;

        try {
            const res = await fetch(`/api/blog/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setPosts(posts.filter(p => p.id !== id));
                setSelectedPosts(selectedPosts.filter(pid => pid !== id));
            } else {
                alert('Erro ao remover post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const toggleSelectPost = (id) => {
        if (selectedPosts.includes(id)) {
            setSelectedPosts(selectedPosts.filter(pid => pid !== id));
        } else {
            setSelectedPosts([...selectedPosts, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedPosts.length === posts.length) {
            setSelectedPosts([]);
        } else {
            setSelectedPosts(posts.map(p => p.id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedPosts.length === 0) return;
        if (!confirm(`Tem certeza que deseja remover ${selectedPosts.length} posts selecionados?`)) return;

        setDeleting(true);
        try {
            // Deletar um por um (idealmente seria uma API de bulk delete)
            for (const id of selectedPosts) {
                await fetch(`/api/blog/${id}`, { method: 'DELETE' });
            }

            setPosts(posts.filter(p => !selectedPosts.includes(p.id)));
            setSelectedPosts([]);
            alert('Posts removidos com sucesso!');
        } catch (error) {
            console.error('Error deleting posts:', error);
            alert('Erro ao remover alguns posts');
        } finally {
            setDeleting(false);
        }
    };

    const toggleVisibility = async () => {
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showBlog: !showBlog })
            });
            if (res.ok) {
                setShowBlog(!showBlog);
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000', margin: 0 }}>
                    Gerenciar Blog Social
                </h1>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                    <input
                        type="checkbox"
                        checked={showBlog}
                        onChange={toggleVisibility}
                        style={{ width: '20px', height: '20px' }}
                    />
                    Seção Visível na Home
                </label>
            </div>

            {/* Add New Post */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Adicionar Novo Post</h2>
                <form onSubmit={handleAddPost} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Cole o link do Instagram, Facebook ou Pinterest aqui..."
                        required
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary"
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {submitting ? 'Adicionando...' : '➕ Adicionar Post'}
                    </button>
                </form>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    Suporta links de posts do Instagram, Facebook e Pinterest.
                </p>
            </div>

            {/* Bulk Actions */}
            {posts.length > 0 && (
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={posts.length > 0 && selectedPosts.length === posts.length}
                            onChange={toggleSelectAll}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 'bold' }}>Selecionar Todos ({selectedPosts.length})</span>
                    </div>

                    {selectedPosts.length > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            disabled={deleting}
                            style={{
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                opacity: deleting ? 0.7 : 1
                            }}
                        >
                            {deleting ? 'Removendo...' : `🗑️ Remover Selecionados (${selectedPosts.length})`}
                        </button>
                    )}
                </div>
            )}

            {/* Posts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {posts.map(post => (
                    <div key={post.id} className="card" style={{ position: 'relative', padding: '1rem', border: selectedPosts.includes(post.id) ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
                            <input
                                type="checkbox"
                                checked={selectedPosts.includes(post.id)}
                                onChange={() => toggleSelectPost(post.id)}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem', marginLeft: '2rem' }}>
                            <span style={{
                                fontSize: '0.8rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                background: '#eee',
                                color: '#333'
                            }}>
                                {post.platform}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem' }}>
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <div style={{ overflow: 'hidden' }}>
                            <SocialEmbed url={post.embedUrl} platform={post.platform} />
                        </div>

                        <button
                            onClick={() => handleDeletePost(post.id)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(255,0,0,0.8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}
                            title="Remover Post"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                    Nenhum post adicionado ainda.
                </div>
            )}
        </div>
    );
}
