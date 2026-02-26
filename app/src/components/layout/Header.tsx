"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useXpBalance } from "@/hooks/useXpBalance";

export function Header() {
  const { connected } = useWallet();
  const { data: xp, isLoading, error } = useXpBalance();

  return (
    <header className="w-full border-b bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Left Side */}
        <Link href="/" className="text-xl font-bold">
          Superteam Academy
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* XP Display */}
          {connected && (
            <div className="bg-indigo-50 dark:bg-indigo-900 px-4 py-2 rounded-lg border">
              {isLoading && (
                <p className="text-sm text-gray-500">Loading XP...</p>
              )}

              {error && (
                <p className="text-sm text-red-500">
                  XP Not Initialized
                </p>
              )}

              {!isLoading && !error && (
                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  XP: {xp ?? 0}
                </p>
              )}
            </div>
          )}

          {/* Wallet Button */}
          <WalletMultiButton />

        </div>
      </div>
    </header>
  );
}