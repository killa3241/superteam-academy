"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then(mod => ({ default: mod.WalletMultiButton })),
  { ssr: false }
);

export function WalletConnection() {
  const { connected, publicKey, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex items-center space-x-4">
        <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700" />
      </div>
    );
  }

  const truncatedAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : "Unknown";

  return (
    <div className="flex items-center space-x-4">
      <Badge variant="secondary" className="text-green-600 border-green-600">
        Connected
      </Badge>
      <span className="text-sm font-mono text-gray-600">
        {truncatedAddress}
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => disconnect()}
      >
        Disconnect
      </Button>
    </div>
  );
}
