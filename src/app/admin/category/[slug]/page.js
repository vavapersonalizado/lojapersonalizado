"use client";

import { useStore } from "@/context/StoreContext";
import { useParams } from "next/navigation";
import styles from "./category.module.css";

export default function CategoryPage() {
    const { slug } = useParams();
    const { categories, getProductsByCategory, addProduct } = useStore();

    const category = categories.find(c => c.id === slug);
    const products = getProductsByCategory(slug);

    if (!category) {
        return <div>Categoria não encontrada</div>;
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

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>{category.name}</h1>
                <button onClick={handleAddProduct} className="btn btn-primary">
                    + Adicionar Produto
                </button>
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
