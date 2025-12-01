"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./navbar.module.css";

export default function ModeSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const isAdminMode = pathname.startsWith("/admin");

    const toggleMode = (mode) => {
        if (mode === "admin") {
            router.push("/admin/users");
        } else {
            router.push("/");
        }
    };

    return (
        <div className={styles.switcher}>
            <button
                onClick={() => toggleMode("client")}
                className={`${styles.switcherBtn} ${!isAdminMode ? styles.switcherBtnActive : ""}`}
            >
                Cliente
            </button>
            <button
                onClick={() => toggleMode("admin")}
                className={`${styles.switcherBtn} ${isAdminMode ? styles.switcherBtnActive : ""}`}
            >
                Admin
            </button>
        </div>
    );
}
