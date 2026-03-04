"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { deriveLevel } from "@/domain/level";
import { useLanguage } from "@/context/LanguageContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCourses } from "@/domain/mockCourses";
import { CertificateService } from "@/services/CertificateService";
import Link from "next/link";

interface PublicProfileData {
  wallet: string;
  bio: string;
  xp: number;
  completedCourses: string[];
  credentials: string[];
}

export default function PublicProfilePage() {
  const params = useParams();
  const wallet = params?.username as string;
  const { t } = useLanguage();

  const [profile, setProfile] =
    useState<PublicProfileData | null>(null);

  useEffect(() => {
    if (!wallet) return;

    const xpKey = `superteam:${wallet}:xp`;
    const storedXp = Number(localStorage.getItem(xpKey) ?? 0);

    const completedCourses: string[] = [];
    const credentials: string[] = [];

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`superteam:${wallet}:enrollment:`)) {
        const courseId = key.split(":").pop();
        const lessonKey = `superteam:${wallet}:lessons:${courseId}`;
        const raw = localStorage.getItem(lessonKey);
        if (!raw) return;

        const flags: number[] = JSON.parse(raw);
        const totalCompleted = flags.reduce(
          (sum, word) => sum + word,
          0
        );

        if (totalCompleted > 0) {
          completedCourses.push(courseId ?? "");
          credentials.push(`${courseId}`);
        }
      }
    });

    const bioKey = `superteam:${wallet}:bio`;
    const storedBio =
      localStorage.getItem(bioKey) ??
      t("profile.defaultBio");

    setProfile({
      wallet,
      bio: storedBio,
      xp: storedXp,
      completedCourses,
      credentials,
    });
  }, [wallet, t]);

  if (!profile) {
    return (
      <div className="p-8">
        {t("profile.loading")}
      </div>
    );
  }

  const level = deriveLevel(profile.xp);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 py-14 space-y-10">

        {/* Identity Card */}
        <Card className="border shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {profile.wallet.slice(0, 6)}...
              {profile.wallet.slice(-4)}
            </CardTitle>
            <CardDescription>
              {t("profile.publicProfile")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Bio */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {t("profile.bio")}
              </p>
              <p className="text-sm">
                {profile.bio}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t text-center">

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  XP
                </p>
                <p className="text-3xl font-bold mt-1">
                  {profile.xp}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t("leaderboard.level")}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {level}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t("profile.completedCourses")}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {profile.completedCourses.length}
                </p>
              </div>

            </div>

          </CardContent>
        </Card>

        {/* Completed Courses */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("profile.completedCourses")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            {profile.completedCourses.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t("profile.noCourses")}
              </p>
            ) : (
             profile.completedCourses.map((courseId) => {
              const course = mockCourses.find(c => c.id === courseId);

              return (
                <Link
                  key={courseId}
                  href={`/certificates/${courseId}`}
                  className="group flex items-center justify-between border rounded-lg px-5 py-4 text-sm font-semibold transition-all duration-200 hover:bg-muted hover:shadow-md hover:-translate-y-[1px] cursor-pointer"
                >
                  <span>
                    {course ? t(course.title) : courseId}
                  </span>

                  {/* Stronger Arrow */}
                  <span className="text-base font-bold text-foreground transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              );
            })
          )}

          </CardContent>
        </Card>

        {/* Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("profile.credentials")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">

            {profile.credentials.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t("profile.noCredentials")}
              </p>
            ) : (
              profile.credentials.map((credential) => (
                <Badge
                  key={credential}
                  variant="secondary"
                  className="px-4 py-2 text-sm"
                >
                  {(() => {
                    const course = mockCourses.find(c => c.id === credential);
                    return course ? t(course.title) : credential;
                  })()}
                </Badge>
              ))
            )}

          </CardContent>
        </Card>

      </main>
    </div>
  );
}