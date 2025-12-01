"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ModeSwitcher from "./ModeSwitcher";
import styles from "./navbar.module.css";

export default function Navbar() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header className={styles.header}>
            <div className={`container ${styles.nav}`}>
                <Link href="/" className={styles.logo}>
                    Loja Premium
                </Link>

                <div className={styles.actions}>
                    {user.isSuperUser && <ModeSwitcher />}

                    <span className={styles.userInfo}>
                        Olá, {user.name}
                    </span>

                    <button onClick={logout} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
}
