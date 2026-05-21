import "./globals.css";
import { Providers } from "./providers";
import { Inter, Outfit } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ChatWidget from "@/components/ChatWidget";
import MainLayout from "@/components/MainLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
    title: {
        default: "MG3D | Tecnologia em Impressão 3D",
        template: "%s | MG3D"
    },
    description: "Produtos exclusivos criados com tecnologia de impressão 3D de alta precisão. Peças decorativas, colecionáveis e utilitários personalizados.",
    keywords: ["impressão 3d", "3d printing", "personalizados", "colecionáveis", "peças técnicas", "MG3D"],
    authors: [{ name: "MG3D" }],
    creator: "MG3D",
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: "https://mg3d.vercel.app",
        siteName: "MG3D | Tecnologia em Impressão 3D",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "MG3D Impressão 3D",
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function RootLayout({ children }) {
    let session;
    try {
        session = await getServerSession(authOptions);
    } catch (error) {
        console.error("Failed to fetch session:", error);
    }

    // Fetch AdSense ID
    let adsenseId = null;
    try {
        const adsenseSetting = await prisma.settings.findUnique({
            where: { key: 'adsense_id' }
        });
        adsenseId = adsenseSetting?.value;
    } catch (error) {
        console.error("Failed to fetch settings:", error);
    }

    return (
        <html lang="pt-BR">
            <head>
            </head>
            <body className={`${inter.className} ${outfit.variable}`}>
                <Providers session={session}>
                    <ThemeProvider>
                        <MainLayout>
                            {children}
                        </MainLayout>
                        <ChatWidget />
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    );
}
