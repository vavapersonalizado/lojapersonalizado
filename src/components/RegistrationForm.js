"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import styles from "./registration.module.css";

export default function RegistrationForm() {
    const { user } = useAuth();
    const { updateUserProfile, userProfiles } = useStore();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (user && user.email) {
            updateUserProfile(user.email, formData);
            // Force reload to update UI context
            window.location.reload();
        }
    };

    // If not logged in OR if profile already exists, don't show
    if (!user || (userProfiles && userProfiles[user.email])) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.card}>
                <h2 className={styles.title}>Complete seu Cadastro</h2>
                <p className={styles.subtitle}>Precisamos de alguns dados para entregar seus pedidos.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div>
                        <label className={styles.label}>Nome Completo</label>
                        <input
                            required
                            className="input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={styles.label}>Endereço de Entrega</label>
                        <input
                            required
                            className="input"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={styles.label}>Telefone / WhatsApp</label>
                        <input
                            required
                            className="input"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Salvar e Continuar
                    </button>
                </form>
            </div>
        </div>
    );
}
