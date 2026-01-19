import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL('https://cildimguvende.com'),
  title: {
    default: "Cildim Güvende | Kozmetik İçerik Analizi",
    template: "%s | Cildim Güvende"
  },
  description: "Kullandığınız kozmetik ürünlerinin içinde ne olduğunu öğrenin. Cildim Güvende ile içerik analizi yapın, cildiniz için en güvenli ürünleri keşfedin.",
  openGraph: {
    title: "Cildim Güvende",
    description: "Kozmetik ürün içerik analizi ve güvenlik skoru.",
    url: "https://cildimguvende.com",
    siteName: "Cildim Güvende",
    locale: "tr_TR",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
