import { Program, AnchorProvider, Idl, web3 } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";

import rawIdl from "@/lib/idl/onchain_academy.json";

const idl = rawIdl as Idl;

export function createProgram(
  wallet: AnchorWallet,
  connection: Connection
): Program {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );

  const programId = new PublicKey(
    (idl as any).address
  );

  return new Program(idl, programId, provider);
}