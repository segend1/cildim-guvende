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
    default: "Cildim Güvende | Kozmetik İçerik Analizi ve Karşılaştırma",
    template: "%s | Cildim Güvende"
  },
  description: "Kozmetik içerikleri inceleme, içerik analizi ve ürün karşılaştırma platformu. Cildim Güvende ile doğal kozmetik ve içerik güvenliği hakkında detaylı bilgi alın.",
  keywords: [
    "kozmetik içerikleri inceleme",
    "kozmetik içerik karşılaştırma",
    "kozmetik karşılaştırma",
    "doğal kozmetik",
    "doğal kozmetik içerikleri",
    "kozmetik analiz",
    "içerik analizi"
  ],
  openGraph: {
    title: "Cildim Güvende | Kozmetik İçerik Analizi",
    description: "Kozmetik ürün içerik analizi, doğal kozmetik incelemeleri ve ürün karşılaştırma.",
    url: "https://cildimguvende.com",
    siteName: "Cildim Güvende",
    locale: "tr_TR",
    type: "website",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
