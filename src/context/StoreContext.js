"use client";

import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext();

const INITIAL_CATEGORIES = [
    { id: "roupas", name: "Roupas" },
    { id: "canecas", name: "Canecas" },
    { id: "garrafas", name: "Garrafas" },
];

const INITIAL_PRODUCTS = [
    { id: 1, name: "Camiseta Premium", price: 59.90, categoryId: "roupas", icon: "👕" },
    { id: 2, name: "Caneca Dev", price: 35.00, categoryId: "canecas", icon: "☕" },
    { id: 3, name: "Garrafa Térmica", price: 89.90, categoryId: "garrafas", icon: "🧴" },
];

export const StoreProvider = ({ children }) => {
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [userProfiles, setUserProfiles] = useState({}); // Map userId/email -> { name, address, phone }

    // Load from localStorage on mount
    useEffect(() => {
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

    const addProduct = (product) => {
        setProducts([...products, { ...product, id: Date.now() }]);
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
            addProduct,
            updateUserProfile,
            getProductsByCategory
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
