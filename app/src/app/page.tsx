"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function Home() {
  const { connected } = useWallet();
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-20">

        {/* Hero */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            {t("home.hero.title")}
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("home.hero.subtitle")}
          </p>
        </header>

        {/* Identity Options */}
        <div className="flex flex-col items-center gap-6 mb-20">

          {/* Primary: Wallet */}
          <p className="text-sm text-muted-foreground">
            Connect your wallet to begin
          </p>

          {/* Divider */}
          <div className="flex items-center w-64">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-xs text-gray-500 uppercase">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Secondary: Google */}
          {!session && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                trackEvent("google_login");
                signIn("google");
              }}
              className="px-8 flex items-center gap-3 border-gray-300 hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.4 0 6.4 1.2 8.8 3.6l6.6-6.6C35.6 2.3 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.7 6C12.2 13.5 17.6 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.2 5.6c4.2-3.9 6.6-9.7 6.6-16.8z"
                />
                <path
                  fill="#4A90E2"
                  d="M10.4 28.3c-.6-1.7-1-3.4-1-5.3s.3-3.6 1-5.3l-7.7-6C1 15.6 0 19.7 0 24s1 8.4 2.7 12.3l7.7-6z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 48c6.2 0 11.4-2 15.2-5.4l-7.2-5.6c-2 1.3-4.6 2.1-8 2.1-6.4 0-11.8-4-13.6-9.8l-7.7 6C6.6 42.6 14.6 48 24 48z"
                />
              </svg>
              Continue with Google
            </Button>
          )}

        </div>

        {/* Positioning */}
        <section className="max-w-5xl mx-auto mb-20">
          <Card className="shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl">
                {t("home.why.title")}
              </CardTitle>
              <CardDescription>
                {t("home.why.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {t("home.why.description")}
              </p>
              <p className="mt-6 text-sm text-muted-foreground">
                {t("home.why.ecosystem")}
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>• {t("home.why.point1")}</li>
                <li>• {t("home.why.point2")}</li>
                <li>• {t("home.why.point3")}</li>
                <li>• {t("home.why.point4")}</li>
                <li>• {t("home.why.point5")}</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Learn / Earn Grid */}
        <main className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">

            <Card className="shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">
                  {t("home.learn.title")}
                </CardTitle>
                <CardDescription>
                  {t("home.learn.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>• {t("home.learn.point1")}</li>
                  <li>• {t("home.learn.point2")}</li>
                  <li>• {t("home.learn.point3")}</li>
                  <li>• {t("home.learn.point4")}</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">
                  {t("home.earn.title")}
                </CardTitle>
                <CardDescription>
                  {t("home.earn.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>• {t("home.earn.point1")}</li>
                  <li>• {t("home.earn.point2")}</li>
                  <li>• {t("home.earn.point3")}</li>
                  <li>• {t("home.earn.point4")}</li>
                </ul>
              </CardContent>
            </Card>

          </div>
        </main>

      </div>
    </div>
  );
}