import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "SmartCaravan | Coding Pour Tous",
  description: "Plateforme intelligente de suivi et de monitoring pour la caravane éducative Coding Pour Tous.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased bg-[#F8F9FC] text-[#1F3C6D]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
