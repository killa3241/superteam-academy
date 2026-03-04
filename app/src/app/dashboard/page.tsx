"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useXpBalance } from "@/hooks/useXpBalance";
import { StreakService } from "@/services/StreakService";
import {
  Achievement,
  AchievementService,
} from "@/services/AchievementService";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { t } = useLanguage();
  const router = useRouter();

  const { data: xp, isLoading, error } = useXpBalance();

  const [streak, setStreak] = useState<number>(0);
  const [achievements, setAchievements] =
    useState<Achievement[]>([]);

  useEffect(() => {
    if (!publicKey) return;
    const service = new StreakService();
    setStreak(service.getCurrentStreak(publicKey));
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey) return;
    const service = new AchievementService();
    setAchievements(service.getAchievements(publicKey));
  }, [publicKey]);

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-4">
          {t("dashboard.connectWallet")}
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-6 py-6 flex-1">

        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            {t("dashboard.welcome")}
          </p>
        </div>

        {/* Reputation Overview */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">

          {/* XP */}
          <Card className="border-primary/30 bg-primary/5 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-primary">
                {t("dashboard.xpTitle")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("dashboard.xpDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-5">
              {isLoading && (
                <p className="text-muted-foreground text-sm">
                  {t("common.loading")}
                </p>
              )}

              {error && (
                <p className="text-red-500 text-sm">
                  {t("dashboard.xpError")}
                </p>
              )}

              {!isLoading && !error && (
                <div className="space-y-1">
                  <p className="text-4xl font-bold tracking-tight text-primary">
                    {xp ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t("common.xp")} • On-Chain Reputation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("dashboard.streakTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-5">
              <p className="text-3xl font-semibold tracking-tight">
                {streak}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                {streak === 1
                  ? t("dashboard.day")
                  : t("dashboard.days")}
              </p>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("dashboard.achievementsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-5 space-y-2">
              {achievements.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.noAchievements")}
                </p>
              )}

              {achievements.map((a) => (
                <div
                  key={a.type}
                  className="inline-block rounded-full border px-3 py-1 text-[10px] font-medium tracking-wide hover:bg-muted transition-colors"
                >
                  {a.type.replaceAll("_", " ")}
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* Continue Learning */}
        <section>
          <h2 className="text-base font-semibold tracking-tight mb-4">
            {t("dashboard.continueLearning.title")}
          </h2>

          <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-5 flex items-center justify-between">

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t("dashboard.continueLearning.inProgress")}
                </p>
                <p className="text-base font-semibold mt-1">
                  {t("dashboard.continueLearning.courseName")}
                </p>
              </div>

              <Button
                size="sm"
                className="font-medium"
                onClick={() => router.push("/courses")}
              >
                {t("dashboard.continueLearning.resume")}
              </Button>

            </CardContent>
          </Card>
        </section>

      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-6 py-6 text-center text-muted-foreground text-sm">
          <p>{t("dashboard.footerLine1")}</p>
          <p className="mt-1">
            {t("dashboard.footerLine2")}
          </p>
        </div>
      </footer>
    </div>
  );
}