"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CertificateService } from "@/services/CertificateService";
import type { Certificate } from "@/domain/types";
import { useLanguage } from "@/context/LanguageContext";
import { mockCourses } from "@/domain/mockCourses";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params?.id as string;
  const { t } = useLanguage();

  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!certificateId) return;
    const cert = CertificateService.getCertificate(certificateId);
    setCertificate(cert);
  }, [certificateId]);

  if (!certificate) {
    return <div className="p-8">{t("certificate.loading")}</div>;
  }

  /* ---------------- Resolve Course Title Dynamically ---------------- */

  const course = mockCourses.find(
    (c) => c.id === certificate.courseId
  );

  const translatedCourseTitle = course
    ? t(course.title)
    : certificate.courseId;

  /* ---------------- Resolve Display Name ---------------- */

  const shortWallet =
    certificate.recipientWallet.length > 10
      ? `${certificate.recipientWallet.slice(0, 4)}...${certificate.recipientWallet.slice(-4)}`
      : certificate.recipientWallet;

  const profileKey = `superteam:${certificate.recipientWallet}:profile`;
  const storedProfile = JSON.parse(
    localStorage.getItem(profileKey) ?? "{}"
  );

  const recipientName =
    storedProfile.displayName ?? shortWallet;

  const explorerUrl = certificate.mintAddress
    ? `https://explorer.solana.com/address/${certificate.mintAddress}?cluster=devnet`
    : null;

  return (
  <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">

    <div className="w-full max-w-4xl border-2 border-black/10 rounded-2xl p-12 bg-white shadow-xl text-center space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground">
          Verifiable Credential
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          {t("certificate.title")}
        </h1>

        <p className="text-sm text-muted-foreground">
          {t("certificate.subtitle")}
        </p>
      </div>

      {/* Recipient */}
      <div className="space-y-3">
        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground">
          {t("certificate.awardedTo")}
        </p>

        <h2 className="text-4xl font-semibold tracking-tight">
          {recipientName}
        </h2>

        <p className="text-xs text-muted-foreground break-all">
          {certificate.recipientWallet}
        </p>
      </div>

      {/* Course */}
      <div className="space-y-2">
        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground">
          {t("certificate.completed")}
        </p>

        <h3 className="text-2xl font-medium">
          {translatedCourseTitle}
        </h3>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-24 pt-6 border-t border-black/5">

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("certificate.xpEarned")}
          </p>
          <p className="text-lg font-semibold mt-2">
            {certificate.xpEarned} {t("common.xp")}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("certificate.issuedAt")}
          </p>
          <p className="text-lg font-semibold mt-2">
            {new Date(certificate.issuedAt).toLocaleDateString()}
          </p>
        </div>

      </div>

      {/* Mint Section */}
      {certificate.mintAddress && (
        <div className="pt-6 border-t border-black/5 space-y-4">

          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("certificate.mintAddress")}
          </p>

          <p className="text-sm font-mono break-all text-muted-foreground">
            {certificate.mintAddress}
          </p>

          {explorerUrl && (
            <button
              onClick={() => window.open(explorerUrl, "_blank")}
              className="inline-flex items-center justify-center rounded-md border px-5 py-2 text-sm font-medium transition hover:bg-muted hover:shadow-sm"
            >
              {t("certificate.viewExplorer")}
            </button>
          )}
        </div>
      )}

      {/* Footer Buttons */}
      <div className="pt-8 flex justify-center gap-4">

        <Link href="/courses">
          <button className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-6 py-2 text-sm font-medium transition hover:opacity-90">
            {t("certificate.back")}
          </button>
        </Link>

      </div>

    </div>

  </div>
);
}