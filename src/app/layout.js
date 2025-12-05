import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
    title: "Vanessa Yachiro Personalizados",
    description: "Sua loja de produtos personalizados",
};

import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Header from "@/components/Header";

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                <Providers>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <Header />
                        <div style={{ display: 'flex', flex: 1 }}>
                            <Sidebar />
                            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                                {children}
                            </main>
                            <RightSidebar />
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
