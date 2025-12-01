"use client";

import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/context/StoreContext";
import RegistrationForm from "@/components/RegistrationForm";

export function Providers({ children }) {
    return (
        <AuthProvider>
            <StoreProvider>
                {children}
                <RegistrationForm />
            </StoreProvider>
        </AuthProvider>
    );
}
