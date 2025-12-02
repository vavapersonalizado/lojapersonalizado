"use client";

import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext();

const INITIAL_CATEGORIES = [];
const INITIAL_PRODUCTS = [];

export const StoreProvider = ({ children }) => {
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [userProfiles, setUserProfiles] = useState({}); // Map userId/email -> { name, address, phone }

    // Load from localStorage on mount
    useEffect(() => {
        // FORCE CLEAR OLD DATA (Migration)
        const storedProdsRaw = localStorage.getItem("products");
        if (storedProdsRaw) {
            const parsed = JSON.parse(storedProdsRaw);
            // Check if it contains the old fake product "Camiseta Premium" (id: 1)
            if (parsed.some(p => p.id === 1 && p.name === "Camiseta Premium")) {
                console.log("Clearing old fake data...");
                localStorage.removeItem("products");
                localStorage.removeItem("categories");
                setProducts([]);
                setCategories([]);
                return; // Stop loading old data
            }
        }

        const storedCats = localStorage.getItem("categories");
        const storedProds = localStorage.getItem("products");
        const storedProfiles = localStorage.getItem("userProfiles");

        if (storedCats) setCategories(JSON.parse(storedCats));
        if (storedProds) setProducts(JSON.parse(storedProds));
        if (storedProfiles) setUserProfiles(JSON.parse(storedProfiles));
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("categories", JSON.stringify(categories));
        localStorage.setItem("products", JSON.stringify(products));
        localStorage.setItem("userProfiles", JSON.stringify(userProfiles));
    }, [categories, products, userProfiles]);

    const addCategory = (name) => {
        const id = name.toLowerCase().replace(/ /g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        setCategories([...categories, { id, name }]);
    };

    const deleteCategory = (id) => {
        setCategories(categories.filter(c => c.id !== id));
        // Optional: Delete products in this category? For now, keep them or orphan them.
    };

    const addProduct = (product) => {
        setProducts([...products, { ...product, id: Date.now() }]);
    };

    const updateProduct = (id, updatedData) => {
        setProducts(products.map(p => p.id === id ? { ...p, ...updatedData } : p));
    };

    const deleteProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const updateUserProfile = (email, data) => {
        setUserProfiles(prev => ({
            ...prev,
            [email]: data
        }));
    };

    const getProductsByCategory = (categoryId) => {
        return products.filter(p => p.categoryId === categoryId);
    };

    return (
        <StoreContext.Provider value={{
            categories,
            products,
            userProfiles,
            addCategory,
            deleteCategory,
            addProduct,
            updateProduct,
            deleteProduct,
            updateUserProfile,
            getProductsByCategory
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
