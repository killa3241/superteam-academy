"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

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

export default function LeaderboardPage() {
  const { publicKey } = useWallet();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);

        const service = new LeaderboardService();

        const topUsers = await service.getTopUsers(50);
        setEntries(topUsers);

        if (publicKey) {
          const rank = await service.getUserRank(publicKey as PublicKey);
          setUserRank(rank);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [publicKey]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 space-y-8">

        <div>
          <h1 className="text-3xl font-bold mb-2">Global Leaderboard</h1>
          <p className="text-muted-foreground">
            Top learners ranked by XP.
          </p>
        </div>

        {publicKey && userRank !== null && userRank > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Rank</CardTitle>
              <CardDescription>
                Based on total XP earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">#{userRank}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Top Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entries.map((entry) => {
                const isCurrentUser =
                  publicKey?.toBase58() === entry.wallet;

                return (
                  <div
                    key={entry.wallet}
                    className={`flex justify-between items-center border rounded-lg px-4 py-3 ${
                      isCurrentUser ? "bg-muted/40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold w-8">
                        #{entry.rank}
                      </span>

                      <div>
                        <p className="font-semibold">
                          {entry.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Level {entry.level}
                        </p>
                      </div>
                    </div>

                    <Badge variant="secondary">
                      {entry.xp} XP
                    </Badge>
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