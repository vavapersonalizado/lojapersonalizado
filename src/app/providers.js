"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ViewProvider } from "@/contexts/ViewContext";
import { CompareProvider } from "@/contexts/CompareContext";

export function Providers({ children }) {
    return (
        <SessionProvider>
            <LanguageProvider>
                <CartProvider>
                    <ViewProvider>
                        <CompareProvider>
                            {children}
                        </CompareProvider>
                    </ViewProvider>
                </CartProvider>
            </LanguageProvider>
        </SessionProvider>
    );
}
