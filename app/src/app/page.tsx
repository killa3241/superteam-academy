"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { UserProfile } from "@/components/UserProfile";
import { CourseList } from "@/components/CourseList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useXpBalance } from "@/hooks/useXpBalance"

export default function Home() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState<"profile" | "courses">("courses");
  const { data: xp, isLoading, error } = useXpBalance()
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Superteam Academy
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Learn & Earn on Solana
            </p>
            
          </header>

          <main className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>🎓 Learn</CardTitle>
                  <CardDescription>
                    Access high-quality courses on Solana development, DeFi, and more
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Expert-led curriculum</li>
                    <li>• Hands-on projects</li>
                    <li>• Real-world applications</li>
                    <li>• Self-paced learning</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>💎 Earn</CardTitle>
                  <CardDescription>
                    Earn XP, level up, and receive verifiable credentials on-chain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• XP rewards for completion</li>
                    <li>• Level progression system</li>
                    <li>• Soulbound NFT credentials</li>
                    <li>• Lifetime achievement tracking</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="text-center">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Connect your wallet to begin your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Join thousands of learners earning XP and building their future on Solana
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
          

      <main className="container mx-auto px-4 py-8">
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
