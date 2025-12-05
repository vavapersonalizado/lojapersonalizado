"use client";

export default function RightSidebar() {
    return (
        <aside className="glass" style={{
            width: '280px',
            padding: '1.5rem',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
        }}>
            {/* Promoções */}
            <section>
                <h3 style={{
                    fontSize: '1.1rem',
                    marginBottom: '1rem',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    🔥 Promoções
                </h3>
                <div style={{
                    background: 'linear-gradient(135deg, var(--secondary), #ec4899)',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)'
                }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Oferta Relâmpago!</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        Canecas personalizadas com <strong>20% OFF</strong>.
                    </p>
                    <button className="btn" style={{
                        background: 'white',
                        color: 'var(--secondary)',
                        marginTop: '1rem',
                        width: '100%',
                        fontSize: '0.8rem'
                    }}>
                        Ver Oferta
                    </button>
                </div>
            </section>

            {/* Eventos */}
            <section>
                <h3 style={{
                    fontSize: '1.1rem',
                    marginBottom: '1rem',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    📅 Próximos Eventos
                </h3>
                <div style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    padding: '1rem',
                    borderRadius: 'var(--radius)'
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Feira de Artesanato</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>15 de Dezembro, 14h</p>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1rem' }}></div>
                    <div>
                        <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Workshop de Personalização</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>20 de Janeiro, 10h</p>
                    </div>
                </div>
            </section>

            {/* Propaganda / Espaço Livre */}
            <section style={{ flex: 1 }}>
                <div style={{
                    background: 'var(--muted)',
                    height: '100%',
                    minHeight: '200px',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--muted-foreground)',
                    fontSize: '0.9rem',
                    border: '2px dashed var(--border)'
                }}>
                    Espaço para Propaganda
                </div>
            </section>
        </aside>
    );
}
