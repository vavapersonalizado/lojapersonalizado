import SocialEmbed from '@/components/SocialEmbed';
import prisma from '@/lib/prisma';

export const metadata = {
    title: "Blog Social | Vanessa Yachiro Personalizados",
    description: "Acompanhe nossas novidades e inspirações do Instagram, Facebook e Pinterest.",
};

export const revalidate = 60;

export default async function BlogPage() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Mural Social
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)', maxWidth: '600px', margin: '0 auto' }}>
                    Fique por dentro das novidades, bastidores e inspirações direto das nossas redes sociais.
                </p>
            </header>

            {posts.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '4rem', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)' }}>Nenhum post encontrado no momento.</p>
                </div>
            ) : (
                <div style={{
                    columns: '300px',
                    columnGap: '1.5rem'
                }}>
                    {posts.map(post => (
                        <div key={post.id} className="glass" style={{
                            breakInside: 'avoid',
                            marginBottom: '1.5rem',
                            borderRadius: 'var(--radius)',
                            padding: '1rem',
                            transition: 'transform 0.3s ease',
                            cursor: 'default',
                            background: 'var(--blogBg, var(--card))'
                        }}>
                            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                <SocialEmbed url={post.embedUrl} platform={post.platform} />
                            </div>

                            <div style={{
                                marginTop: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                paddingTop: '0.75rem'
                            }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--muted-foreground)',
                                    textTransform: 'capitalize'
                                }}>
                                    {post.platform}
                                </span>
                                <a
                                    href={post.embedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--primary)',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    Ver Original ↗
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
