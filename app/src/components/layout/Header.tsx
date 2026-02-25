"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Header() {
  return (
    <header className="w-full border-b bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo / Title */}
        <Link href="/" className="text-xl font-bold">
          Superteam Academy
        </Link>

        {/* Wallet Button */}
        <WalletMultiButton />
      </div>
    </header>
  );
}