"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useXpBalance } from "@/hooks/useXpBalance";

export function Header() {
  const { connected } = useWallet();
  const { data: xp, isLoading, error } = useXpBalance();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Left Side */}
        <Link href="/" className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight">
          Superteam Academy
        </span>
        <span className="text-xs text-muted-foreground">
          Learn & Earn on Solana
        </span>
      </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* XP Display */}
          {connected && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/40 text-sm font-medium">

              {isLoading && (
                <span className="text-muted-foreground">
                  Loading...
                </span>
              )}

              {error && (
                <span className="text-red-500">
                  XP Not Ready
                </span>
              )}

              {!isLoading && !error && (
                <>
                  <span className="text-muted-foreground">
                    XP
                  </span>
                  <span className="font-semibold">
                    {xp ?? 0}
                  </span>
                </>
              )}

            </div>
          )}

          <WalletMultiButton />

        </div>
      </div>
    </header>
  );
}