"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useXpBalance } from "@/hooks/useXpBalance";
import { useXpAnimation } from "@/context/XpAnimationContext";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const { connected } = useWallet();
  const { data: xp, isLoading, error } = useXpBalance();
  const { xpAnimationAmount } = useXpAnimation();

  const [animatedXp, setAnimatedXp] = useState<number>(0);
  const [isPulsing, setIsPulsing] = useState(false);

  const previousXpRef = useRef<number>(0);

  // Sync initial XP
  useEffect(() => {
    if (xp !== undefined && xp !== null) {
      setAnimatedXp(xp);
      previousXpRef.current = xp;
    }
  }, [xp]);

  // Animate when XP increases
  useEffect(() => {
    if (!xp || xp <= previousXpRef.current) return;

    const start = previousXpRef.current;
    const end = xp;
    const duration = 700;
    const startTime = performance.now();

    setIsPulsing(true);

    function animate(time: number) {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      const current = Math.floor(start + (end - start) * eased);
      setAnimatedXp(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousXpRef.current = end;
        setIsPulsing(false);
      }
    }

    requestAnimationFrame(animate);
  }, [xp]);

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
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/40 text-sm font-medium transition-transform duration-300 ${
                isPulsing ? "scale-105" : "scale-100"
              }`}
            >
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
                    {animatedXp}
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