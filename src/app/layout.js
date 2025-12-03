import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
    title: "Loja Personalizada",
    description: "Sua loja de produtos personalizados",
};

import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                <Providers>
                    <div style={{ display: 'flex', minHeight: '100vh' }}>
                        <Sidebar />
                        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
