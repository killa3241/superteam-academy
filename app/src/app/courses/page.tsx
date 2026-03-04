"use client";

import { CourseList } from "@/components/CourseList";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLanguage } from "@/context/LanguageContext";

export default function CoursesPage() {
  const { connected } = useWallet();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-4">

        {!connected && (
          <div className="mb-4 text-center space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {t("courses.exploreTitle")}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
              {t("courses.exploreSubtitle")}
            </p>
          </div>
        )}

        {connected && (
          <div className="mb-4 space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {t("courses.catalogTitle")}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
              {t("courses.catalogSubtitle")}
            </p>
          </div>
        )}

        <CourseList />
      </main>
    </div>
  );
}