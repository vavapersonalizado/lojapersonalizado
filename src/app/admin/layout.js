"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import styles from "./admin.module.css";

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const { categories, addCategory } = useStore();

    const handleAddCategory = () => {
        const name = prompt("Nome da nova categoria:");
        if (name) {
            addCategory(name);
        }
    };

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div>
                    <h3 className={styles.sectionTitle}>Gerenciamento</h3>
                    <nav className={styles.nav}>
                        <Link
                            href="/admin/users"
                            className={`${styles.navLink} ${pathname === '/admin/users' ? styles.navLinkActive : ''}`}
                        >
                            Usuários
                        </Link>
                    </nav>
                </div>

                <div>
                    <h3 className={styles.sectionTitle}>Categorias</h3>
                    <nav className={styles.nav}>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.id}`}
                                className={`${styles.navLink} ${pathname === `/category/${cat.id}` ? styles.navLinkActive : ''}`}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>
                    <button onClick={handleAddCategory} className={`btn btn-outline ${styles.addBtn}`}>
                        + Nova Categoria
                    </button>
                </div>
            </aside>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
