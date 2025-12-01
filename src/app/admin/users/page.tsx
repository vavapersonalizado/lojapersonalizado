"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./users.module.css";

const MOCK_USERS = [
    { id: 1, name: "João Silva", email: "joao@email.com", address: "Rua A, 123", contact: "11 99999-9999", role: "client" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", address: "Av B, 456", contact: "11 88888-8888", role: "admin" },
    { id: 3, name: "Pedro Oliveira", email: "pedro@email.com", address: "Rua C, 789", contact: "11 77777-7777", role: "editor" },
    { id: 4, name: "Ana Costa", email: "ana@email.com", address: "Av D, 101", contact: "11 66666-6666", role: "client_10" },
    { id: 5, name: "Lucas Pereira", email: "lucas@email.com", address: "Rua E, 202", contact: "11 55555-5555", role: "client_coupon" },
];

const ROLES = [
    { value: "admin", label: "Admin" },
    { value: "editor", label: "Editor" },
    { value: "client", label: "Cliente" },
    { value: "client_10", label: "Cliente 10%" },
    { value: "client_coupon", label: "Cliente Cupom" },
];

export default function UsersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState(MOCK_USERS);

    useEffect(() => {
        if (!loading && (!user || !user.isSuperUser)) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading || !user || !user.isSuperUser) return null;

    const handleRoleChange = (userId, newRole) => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    const getBadgeClass = (role) => {
        switch (role) {
            case "admin": return styles.badgeAdmin;
            case "editor": return styles.badgeEditor;
            case "client": return styles.badgeClient;
            case "client_10": return styles.badgeClient10;
            case "client_coupon": return styles.badgeCoupon;
            default: return "";
        }
    };

    const getRoleLabel = (role) => ROLES.find(r => r.value === role)?.label || role;

    return (
        <div className={`container ${styles.container}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Gerenciamento de Usuários</h1>
                <div className="btn btn-primary">Adicionar Usuário</div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Endereço</th>
                            <th>Contato</th>
                            <th>Categoria</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.address}</td>
                                <td>{user.contact}</td>
                                <td>
                                    <span className={`${styles.badge} ${getBadgeClass(user.role)}`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className={styles.select}
                                    >
                                        {ROLES.map((role) => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
