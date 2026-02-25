import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";

import rawIdl from "@/lib/idl/onchain_academy.json";

function normalizeIdl(idlRaw: any): Idl {
  const normalizedAccounts =
    idlRaw.accounts?.map((acc: any) => ({
      ...acc,
      name: String(acc.name).toLowerCase(),
    })) || [];

  const normalizedTypes =
    idlRaw.types?.map((t: any) => ({
      ...t,
      name: String(t.name).toLowerCase(),
    })) || [];

  normalizedAccounts.forEach((acc: any) => {
    if (acc.type && !normalizedTypes.find((t: any) => t.name === acc.name)) {
      normalizedTypes.push({
        name: acc.name,
        type: acc.type,
      });
    }
  });

  return {
    ...idlRaw,
    metadata: {
      address: idlRaw.address,
    },
    accounts: normalizedAccounts,
    types: normalizedTypes,
  } as Idl;
}

const idl = normalizeIdl(rawIdl);

export function createProgram(
  wallet: AnchorWallet,
  connection: Connection
): Program {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );

  return new Program(idl, provider);
}