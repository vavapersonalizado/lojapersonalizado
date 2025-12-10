"use client";

import "./globals.css";
import { Providers } from "./providers";
import { useView } from "@/contexts/ViewContext";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Header from "@/components/Header";
import MobileLayout from "@/components/MobileLayout";
import FloatingCompareIndicator from "@/components/FloatingCompareIndicator";
import ChatWidget from "@/components/ChatWidget";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Inter, Outfit } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { CompareProvider } from "@/contexts/CompareContext";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
                "use client";

                import "./globals.css";
                import {Providers} from "./providers";
                import {useView} from "@/contexts/ViewContext";
                import Sidebar from "@/components/Sidebar";
                import RightSidebar from "@/components/RightSidebar";
                import Header from "@/components/Header";
                import MobileLayout from "@/components/MobileLayout";
                import FloatingCompareIndicator from "@/components/FloatingCompareIndicator";
                import ChatWidget from "@/components/ChatWidget";
                import {getServerSession} from "next-auth";
                import {authOptions} from "./api/auth/[...nextauth]/route";
                import {Inter, Outfit} from "next/font/google";
                import {CartProvider} from "@/contexts/CartContext";
                import {CompareProvider} from "@/contexts/CompareContext";

                const inter = Inter({subsets: ["latin"] });
                const outfit = Outfit({subsets: ["latin"], variable: "--font-outfit" });

                function LayoutContent({children}) {
    const {viewMode, isInitialized} = useView();

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

                export const metadata = {
                    title: {
    default: "Vanessa Yachiro Personalizados",
                template: "%s | Vanessa Yachiro"
  },
                description: "Produtos personalizados com qualidade e carinho. Canecas, camisetas, brindes e muito mais.",
                keywords: ["personalizados", "brindes", "canecas", "camisetas", "presentes", "vanessa yachiro"],
                authors: [{name: "Vanessa Yachiro" }],
                creator: "Vanessa Yachiro",
                openGraph: {
                    type: "website",
                locale: "pt_BR",
                url: "https://lojapersonalizada.vercel.app",
                siteName: "Vanessa Yachiro Personalizados",
                images: [
                {
                    url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Vanessa Yachiro Personalizados",
      },
                ],
  },
                robots: {
                    index: true,
                follow: true,
  },
};

                export default async function RootLayout({children}) {
    const session = await getServerSession(authOptions);

                return (
                <html lang="pt-BR">
                    <body className={`${inter.className} ${outfit.variable}`}>
                        <Providers session={session}>
                            <CartProvider>
                                <CompareProvider>
                                    {children}
                                    <ChatWidget />
                                </CompareProvider>
                            </CartProvider>
                        </Providers>
                    </body>
                </html>
                );
}
