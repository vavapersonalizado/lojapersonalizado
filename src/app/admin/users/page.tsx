"use client";

import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./users.module.css";

const ROLES = [
    { value: "admin", label: "Admin" },
    { value: "editor", label: "Editor" },
    { value: "client", label: "Cliente" },
    { value: "client_10", label: "Cliente 10%" },
    { value: "client_coupon", label: "Cliente Cupom" },
];

export default function UsersPage() {
    const { user, loading } = useAuth();
    const { userProfiles, updateUserProfile } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !user.isSuperUser)) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading || !user || !user.isSuperUser) return null;

    // Convert userProfiles object to array for table display
    const usersList = Object.entries(userProfiles).map(([email, profile]) => {
        const userProfile = profile as any;
        return {
            email,
            ...userProfile,
            role: userProfile.role || "client" // Default role if not set
        };
    });

    const handleRoleChange = (email: string, newRole: string) => {
        const currentProfile = userProfiles[email] || {};
        updateUserProfile(email, { ...currentProfile, role: newRole });
    };

    const getBadgeClass = (role: string) => {
        switch (role) {
            case "admin": return styles.badgeAdmin;
            case "editor": return styles.badgeEditor;
            case "client": return styles.badgeClient;
            case "client_10": return styles.badgeClient10;
            case "client_coupon": return styles.badgeCoupon;
            default: return "";
        }
    };

    const getRoleLabel = (role: string) => ROLES.find(r => r.value === role)?.label || role;

    return (
        <div className={`container ${styles.container}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Gerenciamento de Usuários</h1>
                {/* <div className="btn btn-primary">Adicionar Usuário</div> */}
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
                        {usersList.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                    Nenhum usuário cadastrado ainda.
                                </td>
                            </tr>
                        ) : (
                            usersList.map((u) => (
                                <tr key={u.email}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.address}</td>
                                    <td>{u.phone || u.contact}</td>
                                    <td>
                                        <span className={`${styles.badge} ${getBadgeClass(u.role)}`}>
                                            {getRoleLabel(u.role)}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.email, e.target.value)}
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
