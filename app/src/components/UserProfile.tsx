"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLearningProgressService } from "@/services/LearningProgressService";
import { XPCalculator } from "@/lib/utils/xp";
import { useXpBalance } from "@/hooks/useXpBalance";
import { BN } from "@coral-xyz/anchor";
import type { UserProgressData } from "@/services/LearningProgressService";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLanguage } from "@/context/LanguageContext";

export function UserProfile() {
  const { t } = useLanguage();
  const { publicKey } = useWallet();

  const [userLevel, setUserLevel] = useState<number>(0);
  const [levelProgress, setLevelProgress] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<UserProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const learningService = useLearningProgressService();
  const { data: xpData, isLoading: xpLoading } = useXpBalance();
  const previousLevelRef = useRef<number>(0);

  useEffect(() => {
    if (!learningService) {
      setError(t("profile.connectWallet"));
      setLoading(false);
      return;
    }

    loadUserProgress();
  }, [learningService]);

  useEffect(() => {
    if (xpData === undefined) return;

    const xpNumber = xpData ?? 0;
    const xpBN = new BN(xpNumber);

    const level = XPCalculator.calculateLevel(xpBN);
    const progressToNext = XPCalculator.levelProgress(xpBN);

    setUserLevel(level);
    setLevelProgress(progressToNext);

    if (level > previousLevelRef.current) {
      previousLevelRef.current = level;
    }
  }, [xpData]);

  const loadUserProgress = async () => {
    if (!learningService) return;

    try {
      setLoading(true);
      setError(null);
      const progress = await learningService.getUserProgress();
      setUserProgress(progress);
    } catch (err) {
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading || xpLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.progress")}</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-red-500 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const userXP = xpData ?? 0;

  const completedCourses = userProgress.filter(p => p.isCompleted).length;
  const inProgressCourses = userProgress.filter(p => !p.isCompleted).length;
  const totalLessonsCompleted = userProgress.reduce(
    (sum, p) => sum + p.completedLessons,
    0
  );

  return (
  <div className="space-y-6">

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* LEFT: XP + Stats */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("profile.progress")}</CardTitle>
            <CardDescription>
              {t("profile.pageSubtitle")}
            </CardDescription>
          </div>

          {publicKey && (
            <Link
              href={`/profile/${publicKey.toBase58()}`}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors bg-background hover:bg-muted"
            >
              {t("profile.viewPublic")}
            </Link>
          )}
        </CardHeader>

        <CardContent className="space-y-6">

          {/* XP */}
          <div>
            <p className="text-3xl font-bold text-indigo-600">
              {userXP.toLocaleString()} {t("common.xp")}
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {t("leaderboard.level")} {userLevel}
                </span>
                <span>{Math.round(levelProgress)}%</span>
              </div>
              <Progress value={levelProgress} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
            <div>
              <div className="text-xl font-bold text-green-600">
                {completedCourses}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("profile.completed")}
              </div>
            </div>

            <div>
              <div className="text-xl font-bold text-blue-600">
                {inProgressCourses}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("profile.inProgress")}
              </div>
            </div>

            <div>
              <div className="text-xl font-bold text-purple-600">
                {totalLessonsCompleted}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("profile.lessonsDone")}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* RIGHT: Course Progress */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("profile.completedCourses")}</CardTitle>
          <CardDescription>
            {t("courses.progress")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          {userProgress.length === 0 && (
            <p className="text-muted-foreground text-sm">
              {t("profile.noCourses")}
            </p>
          )}

          {userProgress.map((progress, index) => (
            <div key={index} className="border rounded-md p-4 space-y-2">

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm">
                    {t(progress.course.title)}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {progress.completedLessons}/{progress.totalLessons} {t("courses.lessons")}
                  </p>
                </div>

                <Badge
                  variant={progress.isCompleted ? "default" : "secondary"}
                >
                  {progress.isCompleted
                    ? t("profile.completed")
                    : t("profile.inProgress")}
                </Badge>
              </div>

              <Progress value={progress.progress} />

            </div>
          ))}

        </CardContent>
      </Card>

    </div>

  </div>
);
}