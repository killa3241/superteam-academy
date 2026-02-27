"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { UserProfile } from "@/components/UserProfile";

export default function ProfilePage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-4">
          Please connect your wallet to view your profile.
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Track your XP, level progression, and course achievements.
          </p>
        </div>

        <UserProfile />
      </main>
    </div>
  );
}