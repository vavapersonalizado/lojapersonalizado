"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ViewProvider } from "@/contexts/ViewContext";

export function Providers({ children }) {
    return (
        <SessionProvider>
            <LanguageProvider>
                <CartProvider>
                    <ViewProvider>
                        {children}
                    </ViewProvider>
                </CartProvider>
            </LanguageProvider>
        </SessionProvider>
    );
}
