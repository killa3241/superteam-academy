"use client";

import { useMemo, useEffect, useRef } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter} from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { trackEvent } from "@/lib/analytics";
import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  function WalletAnalyticsTracker() {
    const { connected, publicKey } = useWallet();
    const hasTracked = useRef(false);

    useEffect(() => {
      if (connected && publicKey && !hasTracked.current) {
        trackEvent("wallet_connected", {
          wallet_address: publicKey.toBase58(),
        });

        hasTracked.current = true;
      }

      if (!connected) {
        hasTracked.current = false;
      }
    }, [connected, publicKey]);

    return null;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletAnalyticsTracker />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}