import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ChinaTech - Riparazione Smartphone Professionale",
  description: "Servizio rapido e affidabile per la riparazione di smartphone, tablet e dispositivi elettronici. ChinaTech Milano.",
  keywords: "riparazione smartphone, assistenza tecnica, ChinaTech, Milano, riparazione iPhone, riparazione Samsung",
  authors: [{ name: "ChinaTech" }],
  openGraph: {
    title: "ChinaTech - Riparazione Smartphone Professionale",
    description: "Servizio rapido e affidabile per la riparazione di smartphone e dispositivi elettronici.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
