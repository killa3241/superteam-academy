"use client";

import React, { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.replace("/dashboard");
    }
  }, [connected, router]);

  if (connected) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Superteam Academy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A production-ready Learning Management System built for
            Solana developers. Learn core blockchain concepts, master
            Anchor, complete hands-on challenges, and earn on-chain XP
            and verifiable credentials.
          </p>
        </header>

        {/* Purpose Section */}
        <section className="max-w-5xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Why Superteam Academy?</CardTitle>
              <CardDescription>
                Built for the Superteam Brazil LMS bounty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Superteam Academy is designed to onboard and upskill
                developers in the Solana ecosystem through structured,
                challenge-based learning.
              </p>

              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Structured Solana development tracks</li>
                <li>• Practical coding challenges</li>
                <li>• XP-based progression system</li>
                <li>• On-chain credential infrastructure</li>
                <li>• Future-ready for tokenized achievements</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Learn & Earn Grid */}
        <main className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Learn</CardTitle>
                <CardDescription>
                  Master Solana development fundamentals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Accounts & transactions model</li>
                  <li>• Anchor program development</li>
                  <li>• Token-2022 integration</li>
                  <li>• CPI patterns & PDAs</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earn</CardTitle>
                <CardDescription>
                  Track measurable on-chain progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• XP rewards per lesson</li>
                  <li>• Level progression system</li>
                  <li>• Wallet-based identity</li>
                  <li>• Future soulbound certificates</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}