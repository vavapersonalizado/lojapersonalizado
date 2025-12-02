"use client";

import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
