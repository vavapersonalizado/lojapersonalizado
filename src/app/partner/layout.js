"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function PartnerLayout({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
        // Ideally we should also check if user is a partner here, 
        // but the API calls in children will handle 404/401 gracefully too.
    }, [status, router]);

    if (status === "loading") return <div>Carregando...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
            {/* Sidebar */}
            <aside style={{ width: '250px', background: 'white', borderRight: '1px solid #e5e7eb', padding: '2rem' }}>
                <div style={{ marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
                    Parceiros Vava
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link href="/partner/dashboard" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>
                        📊 Dashboard
                    </Link>
                    <Link href="/partner/profile" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>
                        👤 Meu Perfil
                    </Link>
                    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />
                    <Link href="/" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '0.9rem' }}>
                        ← Voltar para Loja
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem' }}>
                {children}
            </main>
        </div>
    );
}
