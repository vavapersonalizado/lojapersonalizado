"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

const PRODUCTS = [
  { id: 1, name: "Relógio Premium", price: 1299.00, icon: "⌚" },
  { id: 2, name: "Fones de Ouvido Pro", price: 899.00, icon: "🎧" },
  { id: 3, name: "Smartphone Ultra", price: 4599.00, icon: "📱" },
  { id: 4, name: "Laptop Elite", price: 7899.00, icon: "💻" },
  { id: 5, name: "Câmera 4K", price: 3299.00, icon: "📷" },
  { id: 6, name: "Console Next-Gen", price: 3999.00, icon: "🎮" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="container">
      <section className={styles.hero}>
        <h1 className={styles.title}>Tecnologia de Ponta</h1>
        <p className={styles.subtitle}>
          Descubra os produtos mais exclusivos selecionados especialmente para você.
        </p>
      </section>

      <div className={styles.grid}>
        {PRODUCTS.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.imagePlaceholder}>
              {product.icon}
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </p>
              <button className={`btn btn-primary ${styles.addToCartBtn}`}>
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
