"use client";

import { SessionProvider } from "next-auth/react";

export function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}