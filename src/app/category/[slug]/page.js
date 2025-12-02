"use client";

import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import styles from "./category.module.css";

export default function CategoryPage() {
    const { slug } = useParams();
    const { categories, getProductsByCategory, addProduct, deleteProduct, updateProduct } = useStore();
    const { user } = useAuth();

    const category = categories.find(c => c.id === slug);
    const products = getProductsByCategory(slug);
    const isSuperUser = user?.isSuperUser;

    if (!category) {
        return <div className="container" style={{ padding: '2rem' }}>Categoria não encontrada</div>;
    }

    const handleAddProduct = () => {
        const name = prompt("Nome do produto:");
        if (!name) return;

        const priceStr = prompt("Preço (ex: 29.90):");
        const price = parseFloat(priceStr?.replace(',', '.'));
        if (isNaN(price)) return;

        const icon = prompt("Emoji do produto (ex: 👕):") || "📦";

        addProduct({
            name,
            price,
            icon,
            categoryId: slug
        });
    };

    const handleDelete = (id) => {
        if (confirm("Tem certeza que deseja excluir este produto?")) {
            deleteProduct(id);
        }
    };

    const handleEdit = (product) => {
        const name = prompt("Novo nome:", product.name);
        if (name === null) return; // Cancelled

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
        <div className="container" style={{ padding: '2rem 0' }}>
            <div className={styles.header}>
                <h1 className={styles.title}>{category.name}</h1>
                {isSuperUser && (
                    <button onClick={handleAddProduct} className="btn btn-primary">
                        + Adicionar Produto
                    </button>
                )}
            </div>

            {products.length === 0 ? (
                <div className={styles.emptyState}>
                    Nenhum produto nesta categoria ainda.
                </div>
            ) : (
                <div className={styles.grid}>
                    {products.map(product => (
                        <div key={product.id} className={styles.productCard}>
                            <div className={styles.icon}>{product.icon}</div>
                            <div className={styles.name}>{product.name}</div>
                            <div className={styles.price}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                            </div>

                            {isSuperUser && (
                                <div className={styles.actions}>
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className={styles.actionBtn}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                    >
                                        🗑️ Excluir
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
