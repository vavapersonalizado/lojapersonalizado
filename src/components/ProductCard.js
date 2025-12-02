"use client";

import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
    const { user } = useAuth();
    const { deleteProduct, updateProduct } = useStore();
    const isSuperUser = user?.isSuperUser;

    const handleDelete = () => {
        if (confirm("Tem certeza que deseja excluir este produto?")) {
            deleteProduct(product.id);
        }
    };

    const handleEdit = () => {
        const name = prompt("Novo nome:", product.name);
        if (name === null) return;

        const priceStr = prompt("Novo preço:", product.price);
        if (priceStr === null) return;
        const price = parseFloat(priceStr?.replace(',', '.'));

        const icon = prompt("Novo emoji:", product.icon);
        if (icon === null) return;

        updateProduct(product.id, {
            name: name || product.name,
            price: isNaN(price) ? product.price : price,
            icon: icon || product.icon
        });
    };

    return (
        <div className={styles.card}>
            <div className={styles.icon}>{product.icon}</div>
            <h3 className={styles.name}>{product.name}</h3>
            <p className={styles.price}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </p>

            <div className={styles.actions}>
                <button className={`${styles.actionBtn} ${styles.primaryBtn}`}>
                    Adicionar ao Carrinho
                </button>
            </div>

            {isSuperUser && (
                <div className={styles.adminControls}>
                    <button onClick={handleEdit} className={styles.actionBtn}>
                        ✏️ Editar
                    </button>
                    <button onClick={handleDelete} className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                        🗑️ Excluir
                    </button>
                </div>
            )}
        </div>
    );
}
