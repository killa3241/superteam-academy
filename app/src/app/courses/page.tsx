"use client";

import { CourseList } from "@/components/CourseList";
import { useWallet } from "@solana/wallet-adapter-react";

export default function CoursesPage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        {!connected && (
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold mb-2">
              Explore Solana Courses
            </h1>
            <p className="text-muted-foreground">
              Browse available learning tracks. Connect your wallet to track progress and earn XP.
            </p>
          </div>
        )}

        {connected && (
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">
              Course Catalog
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey and earn on-chain XP.
            </p>
          </div>
        )}

        <CourseList />
      </main>
    </div>
  );
}