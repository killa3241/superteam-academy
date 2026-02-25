import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SolanaProviders } from "@/components/SolanaProviders";
import dynamic from "next/dynamic";

const Header = dynamic(
  () => import("@/components/layout/Header").then(mod => mod.Header),
  { ssr: false }
);
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Superteam Academy - Learn & Earn on Solana",
  description: "Decentralized learning platform where you can earn XP, level up, and get verifiable credentials on the Solana blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaProviders>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </SolanaProviders>
      </body>
    </html>
  );
}
