"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { data: session } = useSession();
    const [cart, setCart] = useState([]);
    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availableCoupons, setAvailableCoupons] = useState([]);

    const fetchAvailableCoupons = async () => {
        try {
            const res = await fetch('/api/coupons/available');
            if (res.ok) {
                const data = await res.json();
                setAvailableCoupons(data);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    };

    // Load cart and coupon from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedCoupon = localStorage.getItem('coupon');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
        if (savedCoupon) {
            setCoupon(JSON.parse(savedCoupon));
        }
        setLoading(false);
        fetchAvailableCoupons();
    }, []);

    // Refresh coupons when session changes (user logs in/out)
    useEffect(() => {
        fetchAvailableCoupons();
    }, [session]);

    // Save cart and coupon to localStorage whenever they change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('cart', JSON.stringify(cart));
            if (coupon) {
                localStorage.setItem('coupon', JSON.stringify(coupon));
            } else {
                localStorage.removeItem('coupon');
            }
        }
    }, [cart, coupon, loading]);

    const addToCart = (product, quantity = 1, customization = null) => {
        setCart(prevCart => {
            // Check if item exists with SAME customization
            const existingItem = prevCart.find(item =>
                item.id === product.id &&
                JSON.stringify(item.customization) === JSON.stringify(customization)
            );

            if (existingItem) {
                return prevCart.map(item =>
                    (item.id === product.id && JSON.stringify(item.customization) === JSON.stringify(customization))
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...prevCart, { ...product, quantity, customization }];
        });
    };

    const removeFromCart = (productId, customization = null) => {
        setCart(prevCart => prevCart.filter(item =>
            !(item.id === productId && JSON.stringify(item.customization) === JSON.stringify(customization))
        ));
    };

    const updateQuantity = (productId, quantity, customization = null) => {
        if (quantity <= 0) {
            removeFromCart(productId, customization);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                (item.id === productId && JSON.stringify(item.customization) === JSON.stringify(customization))
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        setCoupon(null);
        localStorage.removeItem('cart');
        localStorage.removeItem('coupon');
    };

    const applyCoupon = (couponData) => {
        setCoupon(couponData);
    };

    const removeCoupon = () => {
        setCoupon(null);
    };

    const getCartTotal = () => {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        if (!coupon) return subtotal;

        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (subtotal * coupon.discount) / 100;
        } else {
            discountAmount = coupon.discount;
        }

        return Math.max(0, subtotal - discountAmount);
    };

    const getSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getDiscountAmount = () => {
        if (!coupon) return 0;
        const subtotal = getSubtotal();
        if (coupon.type === 'percentage') {
            return (subtotal * coupon.discount) / 100;
        } else {
            return coupon.discount;
        }
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                coupon,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                applyCoupon,
                removeCoupon,
                getCartTotal,
                getSubtotal,
                getDiscountAmount,
                getCartCount,
                getCartCount,
                loading,
                availableCoupons,
                fetchAvailableCoupons
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
