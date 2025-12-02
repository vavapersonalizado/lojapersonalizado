import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
    title: "Loja Personalizada",
    description: "Sua loja de produtos personalizados",
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
