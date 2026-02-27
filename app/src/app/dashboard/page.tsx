"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { UserProfile } from "@/components/UserProfile";
import { CourseList } from "@/components/CourseList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useXpBalance } from "@/hooks/useXpBalance";

export default function DashboardPage() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState<"profile" | "courses">("courses");

  const { data: xp, isLoading, error } = useXpBalance();

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-4">
          Please connect your wallet to access your dashboard.
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* XP Summary */}
        <div className="mb-8">
          <Card className="bg-muted/30 border">
            <CardHeader>
              <CardTitle>Your XP</CardTitle>
              <CardDescription>
                Your on-chain learning progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <p className="text-muted-foreground">Loading XP...</p>
              )}

              {error && (
                <p className="text-red-500">Unable to fetch XP</p>
              )}

              {!isLoading && !error && (
                <p className="text-3xl font-bold">
                  {xp ?? 0} XP
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex gap-6 border-b pb-2">
            <Button
              variant={activeTab === "courses" ? "default" : "ghost"}
              onClick={() => setActiveTab("courses")}
            >
              Courses
            </Button>

            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              onClick={() => setActiveTab("profile")}
            >
              My Progress
            </Button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "courses" && <CourseList />}
          {activeTab === "profile" && <UserProfile />}
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>Built with ❤️ for the Solana ecosystem</p>
            <p className="text-sm mt-2">
              Powered by Superteam Brazil
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}