import "./globals.css";
import { Providers } from "./providers";
import { Inter, Outfit } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { CompareProvider } from "@/contexts/CompareContext";
import ChatWidget from "@/components/ChatWidget";
import MainLayout from "@/components/MainLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
    title: {
        default: "Vanessa Yachiro Personalizados",
        template: "%s | Vanessa Yachiro"
    },
    description: "Produtos personalizados com qualidade e carinho. Canecas, camisetas, brindes e muito mais.",
    keywords: ["personalizados", "brindes", "canecas", "camisetas", "presentes", "vanessa yachiro"],
    authors: [{ name: "Vanessa Yachiro" }],
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

export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="pt-BR">
            <body className={`${inter.className} ${outfit.variable}`}>
                <Providers session={session}>
                    <CartProvider>
                        <CompareProvider>
                            <MainLayout>
                                {children}
                            </MainLayout>
                            <ChatWidget />
                        </CompareProvider>
                    </CartProvider>
                </Providers>
            </body>
        </html>
    );
}
