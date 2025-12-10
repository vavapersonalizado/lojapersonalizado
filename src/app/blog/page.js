import SocialEmbed from '@/components/SocialEmbed';
import prisma from '@/lib/prisma';

export const metadata = {
    title: "Blog Social | Vanessa Yachiro Personalizados",
    description: "Acompanhe nossas novidades e inspirações do Instagram, Facebook e Pinterest.",
};

export const revalidate = 60; // Revalidar a cada 60 segundos

export default async function BlogPage() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--foreground)' }}>
                    Nosso Mural Social
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)' }}>
                    Fique por dentro das novidades, bastidores e inspirações direto das nossas redes sociais.
                </p>
            </header>

            {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p>Nenhum post encontrado no momento.</p>
                </div>
            ) : (
                <div style={{
                    columns: '300px', // Masonry-like layout using CSS columns
                    columnGap: '1.5rem'
                }}>
                    {posts.map(post => (
                        <div key={post.id} style={{
                            breakInside: 'avoid',
                            marginBottom: '1.5rem',
                            background: 'var(--card)',
                            borderRadius: 'var(--radius)',
                            padding: '1rem',
                            boxShadow: 'var(--shadow)',
                            border: '1px solid var(--border)'
                        }}>
                            <SocialEmbed url={post.embedUrl} platform={post.platform} />

                            <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                                <a
                                    href={post.embedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}
                                >
                                    Ver no {post.platform.charAt(0) + post.platform.slice(1).toLowerCase()} ↗
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
