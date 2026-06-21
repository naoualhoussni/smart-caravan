import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-poppins",
});

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
      <body className={`${poppins.variable} font-sans antialiased bg-[#F8F9FC] text-[#0B2B5B]`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
