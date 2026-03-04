"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SettingsPage() {
  const { connected, publicKey } = useWallet();
  const { language, setLanguage, t } = useLanguage();
  const { data: session } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  /* ---------------- Load Existing Profile ---------------- */

  useEffect(() => {
    if (!publicKey) return;

    const key = `superteam:${publicKey.toBase58()}:profile`;
    const stored = localStorage.getItem(key);

    if (stored) {
      const parsed = JSON.parse(stored);
      setDisplayName(parsed.displayName ?? "");
      setBio(parsed.bio ?? "");
    }
  }, [publicKey]);

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

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-lg font-semibold">
          {t("settings.connectWallet")}
        </h2>
      </div>
    );
  }

  const handleSaveProfile = () => {
    if (!publicKey) return;

    const key = `superteam:${publicKey.toBase58()}:profile`;

    localStorage.setItem(
      key,
      JSON.stringify({
        displayName,
        bio,
      })
    );

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-3xl px-4 py-6 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            {t("nav.settings")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("settings.description")}
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide">
              {t("settings.profile")}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("settings.profileDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("settings.displayName")}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("settings.bio")}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSaveProfile}
                className={
                  saved
                    ? "bg-green-600 hover:bg-green-600"
                    : ""
                }
              >
                {saved ? "Saved ✓" : t("settings.save")}
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide">
              {t("settings.preferences")}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("settings.preferencesDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("settings.language")}
              </label>
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as "en" | "pt" | "es")
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="es">Español</option>
              </select>
            </div>

          </CardContent>
        </Card>
        {/* Linked Accounts */}
<Card className="shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-semibold uppercase tracking-wide">
      Linked Accounts
    </CardTitle>
    <CardDescription className="text-xs">
      Manage external identity providers
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-4 pt-0">

    {/* Wallet (Primary) */}
    <div className="flex justify-between items-center text-sm">
      <div>
        <p className="font-medium">Wallet</p>
        <p className="text-muted-foreground">
          {publicKey?.toBase58()}
        </p>
      </div>
      <span className="text-green-600 text-xs font-medium">
        Connected
      </span>
    </div>

    {/* Google */}
    <div className="flex justify-between items-center text-sm">
      <div>
        <p className="font-medium">Google</p>
        {session?.user?.email ? (
          <p className="text-muted-foreground">
            {session.user.email}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Not linked
          </p>
        )}
      </div>

            {session ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => signOut()}
              >
                Unlink
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => signIn("google")}
              >
                Link Google
              </Button>
            )}
          </div>

        </CardContent>
      </Card>          
      </main>
    </div>
  );
}