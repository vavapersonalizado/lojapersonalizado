"use client";

import "./globals.css";
import { Providers } from "./providers";
import { useView } from "@/contexts/ViewContext";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Header from "@/components/Header";
import MobileLayout from "@/components/MobileLayout";
import FloatingCompareIndicator from "@/components/FloatingCompareIndicator";

function LayoutContent({ children }) {
    const { viewMode, isInitialized } = useView();

    // Show loading or default layout until initialized
    if (!isInitialized) {
        return (
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
        );
    }

    // Render mobile or desktop layout based on viewMode
    if (viewMode === 'mobile') {
        return <MobileLayout>{children}</MobileLayout>;
    }

    // Desktop layout
    return (
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
    );
}

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                <Providers>
                    <LayoutContent>{children}</LayoutContent>
                    <FloatingCompareIndicator />
                </Providers>
            </body>
        </html>
    );
}
