import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/common/Navbar";
import Footer from "@/app/components/common/Footer";
import { AuthProvider } from "@/app/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeBrate - Proje Partneri Bulma Platformu",
  description:
    "Üniversite öğrencileri için küresel proje partneri bulma platformu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-[#262836]">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
