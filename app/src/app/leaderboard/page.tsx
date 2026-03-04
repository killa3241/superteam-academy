"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { LeaderboardService } from "@/services/LeaderboardService";
import type { LeaderboardEntry } from "@/domain/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

type Period = "all" | "monthly" | "weekly";

export default function LeaderboardPage() {
  const { publicKey } = useWallet();
  const { t } = useLanguage();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("all");

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);

        const service = new LeaderboardService();
        const topUsers = await service.getTopUsers(50);

        const adjusted = topUsers.map((entry) => {
          let adjustedXp = entry.xp;

          if (period === "weekly") {
            adjustedXp = Math.floor(entry.xp * 0.5);
          } else if (period === "monthly") {
            adjustedXp = Math.floor(entry.xp * 0.75);
          }

          return {
            ...entry,
            xp: adjustedXp,
          };
        });

        const sorted = adjusted
          .sort((a, b) => b.xp - a.xp)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        setEntries(sorted);

        if (publicKey) {
          const wallet = publicKey.toBase58();
          const found = sorted.find((e) => e.wallet === wallet);
          setUserRank(found ? found.rank : null);
        }
      } catch (err) {
        console.error("Leaderboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [publicKey, period]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>{t("leaderboard.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-5 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            {t("leaderboard.title")}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            {t("leaderboard.subtitle")}
          </p>
        </div>

        {/* Period Toggle */}
        <div className="flex gap-3">
          <Button size="sm"
            variant={period === "all" ? "default" : "outline"}
            onClick={() => setPeriod("all")}
          >
            {t("leaderboard.allTime")}
          </Button>

          <Button size="sm"
            variant={period === "monthly" ? "default" : "outline"}
            onClick={() => setPeriod("monthly")}
          >
            {t("leaderboard.monthly")}
          </Button>

          <Button size="sm"
            variant={period === "weekly" ? "default" : "outline"}
            onClick={() => setPeriod("weekly")}
          >
            {t("leaderboard.weekly")}
          </Button>
        </div>

        {/* User Rank */}
        {publicKey && userRank && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {t("leaderboard.yourRank")}
              </CardTitle>
              <CardDescription>
                {t("leaderboard.rankDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <p className="text-2xl font-bold tracking-tight text-primary">
                #{userRank}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {t("leaderboard.topLearners")}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              {entries.map((entry) => {
                const isCurrentUser =
                  publicKey?.toBase58() === entry.wallet;

                const profileKey = `superteam:${entry.wallet}:profile`;
                const storedProfile = JSON.parse(
                  localStorage.getItem(profileKey) ?? "{}"
                );

                const displayName =
                  storedProfile.displayName ??
                  `${entry.wallet.slice(0, 4)}...${entry.wallet.slice(-4)}`;

                const isTopThree = entry.rank <= 3;

                return (
                  <div
                    key={entry.wallet}
                    className={`
                      group
                      flex justify-between items-center
                      rounded-lg px-4 py-2
                      border
                      transition-all duration-200
                      hover:shadow-md hover:-translate-y-[1px]
                      ${
                        isCurrentUser
                          ? "bg-primary/10 border-primary/40"
                          : "bg-background"
                      }
                      ${
                        isTopThree
                          ? "border-yellow-400/40 bg-yellow-500/5"
                          : ""
                      }
                    `}
                  >
                    {/* Left Side */}
                    <div className="flex items-center gap-4">
                      <span
                        className={`
                          font-semibold w-8 text-base
                          ${
                            entry.rank === 1
                              ? "text-yellow-500"
                              : entry.rank === 2
                              ? "text-gray-400"
                              : entry.rank === 3
                              ? "text-amber-600"
                              : "text-muted-foreground"
                          }
                        `}
                      >
                        #{entry.rank}
                      </span>

                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">
                          {displayName}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {t("leaderboard.level")} {entry.level}
                        </p>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold tracking-tight">
                        {entry.xp}
                      </span>
                      <Badge variant="secondary">XP</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}