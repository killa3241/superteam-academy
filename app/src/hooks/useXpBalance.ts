"use client"

import { useQuery } from "@tanstack/react-query"
import { useLearningProgressService } from "@/services/LearningProgressService"

export function useXpBalance() {
  const service = useLearningProgressService()

  return useQuery({
    queryKey: ["xp-balance"],
    queryFn: async () => {
      if (!service) throw new Error("Wallet not connected")
      const xp = await service.getUserXPBalance()
      return xp.toNumber()
    },
    enabled: !!service,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}