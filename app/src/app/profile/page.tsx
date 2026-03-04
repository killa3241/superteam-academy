"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { UserProfile } from "@/components/UserProfile";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  const { connected } = useWallet();
  const { t } = useLanguage();

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold mb-4">
          {t("profile.connectWallet")}
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">

        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("profile.pageTitle")}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t("profile.pageSubtitle")}
          </p>
        </div>

        <UserProfile />

      </main>
    </div>
  );
}