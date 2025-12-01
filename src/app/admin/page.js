"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/login");
        } else if (!user.isSuperUser) {
            router.push("/");
        }
    }, [user, router]);

    if (!user || !user.isSuperUser) {
        return null;
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "1rem" }}>
                Painel Administrativo
            </h1>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
                Bem-vindo ao painel de administração. Use a barra lateral para navegar entre as seções.
            </p>

            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                <div style={{
                    padding: "1.5rem",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                }}
                    onClick={() => router.push("/admin/users")}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--ring)"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                >
                    <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>👥 Gerenciar Usuários</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                        Visualize e gerencie os usuários cadastrados
                    </p>
                </div>

                <div style={{
                    padding: "1.5rem",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    opacity: 0.6
                }}>
                    <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>📦 Categorias</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                        Use a barra lateral para gerenciar categorias e produtos
                    </p>
                </div>
            </div>
        </div>
    );
}
