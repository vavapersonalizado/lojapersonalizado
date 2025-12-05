'use client';

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '2rem',
                    textAlign: 'center',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <h2>Algo deu muito errado!</h2>
                    <button
                        onClick={() => reset()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            background: '#0070f3',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Tentar novamente
                    </button>
                </div>
            </body>
        </html>
    );
}
