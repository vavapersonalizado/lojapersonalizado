"use client";

import { useStore } from "@/context/StoreContext";
import styles from "./page.module.css";

export default function Home() {
  const { products } = useStore();

  return (
    <main className="container">
      <section className={styles.hero}>
        <h1 className={styles.title}>Tecnologia de Ponta</h1>
        <p className={styles.subtitle}>
          Descubra os produtos mais exclusivos selecionados especialmente para você.
        </p>
      </section>

      <div className={styles.grid}>
        {products.map((product) => (
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
