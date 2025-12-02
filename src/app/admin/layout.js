import Link from 'next/link';

export default function AdminLayout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside style={{ width: '250px', background: 'var(--secondary)', color: 'var(--secondary-foreground)', padding: '2rem' }}>
                <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Admin</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link href="/admin/products" style={{ color: 'inherit', textDecoration: 'none' }}>📦 Produtos</Link>
                    <Link href="/admin/categories" style={{ color: 'inherit', textDecoration: 'none' }}>🏷️ Categorias</Link>
                    <Link href="/" style={{ marginTop: '2rem', color: 'var(--muted-foreground)', textDecoration: 'none' }}>⬅️ Voltar ao Site</Link>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: '2rem', background: 'var(--background)' }}>
                {children}
            </main>
        </div>
    );
}
