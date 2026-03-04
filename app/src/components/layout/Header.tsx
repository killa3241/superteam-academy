"use client";

import Link from "next/link";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useXpBalance } from "@/hooks/useXpBalance";
import { useXpAnimation } from "@/context/XpAnimationContext";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Header() {
  const { connected } = useWallet();
  const { data: xp, isLoading, error } = useXpBalance();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [animatedXp, setAnimatedXp] = useState<number>(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const previousXpRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------------- Sync Initial XP ---------------- */

  useEffect(() => {
    if (xp !== undefined && xp !== null) {
      setAnimatedXp(xp);
      previousXpRef.current = xp;
    }
  }, [xp]);

  /* ---------------- Animate XP Increase ---------------- */

  useEffect(() => {
    if (!xp || xp <= previousXpRef.current) return;

    const start = previousXpRef.current;
    const end = xp;
    const duration = 700;
    const startTime = performance.now();

    setIsPulsing(true);

    function animate(time: number) {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
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

  /* ---------------- Persist Language ---------------- */

  useEffect(() => {
    const stored = localStorage.getItem("superteam:language");
    if (stored) {
      setLanguage(stored as "en" | "pt" | "es");
    }
  }, [setLanguage]);

  useEffect(() => {
    localStorage.setItem("superteam:language", language);
  }, [language]);

  if (!mounted) return null;

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/courses", label: t("nav.courses") },
    { href: "/profile", label: t("nav.profile") },
    { href: "/leaderboard", label: t("nav.leaderboard") },
    { href: "/settings", label: t("nav.settings") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-10 py-5">

        {/* Brand */}
        <Link href="/" className="flex flex-col leading-tight group">
        <span className="text-lg font-semibold tracking-tight group-hover:opacity-80 transition-opacity">
          Superteam Academy
        </span>
        <span className="text-xs text-muted-foreground">
          {t("nav.tagline")}
        </span>
      </Link>

        {/* Navigation */}
        {connected && (
          <nav className="hidden md:flex items-center gap-10 text-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group"
                >
                  <span
                    className={`transition-colors ${
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>

                  <span
                    className={`absolute left-0 -bottom-2 h-[2px] rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-full bg-foreground"
                        : "w-0 bg-foreground group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6">

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            {mounted && (theme === "dark" ? "☀️" : "🌙")}
          </Button>

          {/* Language */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/30 hover:bg-muted/50 transition-colors">
            <span className="text-sm">🌍</span>
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as "en" | "pt" | "es")
              }
              className="text-sm bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="pt">PT</option>
              <option value="es">ES</option>
            </select>
          </div>

          {/* XP */}
          {connected && (
            <div
              className={`flex items-center gap-2 px-5 py-2 rounded-full border bg-muted/40 text-sm font-medium transition-all duration-300 ${
                isPulsing ? "scale-105" : "scale-100"
              }`}
            >
              {isLoading && (
                <span className="text-muted-foreground">
                  {t("nav.loading")}
                </span>
              )}

              {error && (
                <span className="text-red-500">
                  {t("nav.xpError")}
                </span>
              )}

              {!isLoading && !error && (
                <>
                  <span className="text-muted-foreground tracking-wide">
                    XP
                  </span>
                  <span className="font-semibold text-base">
                    {animatedXp}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Wallet */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}