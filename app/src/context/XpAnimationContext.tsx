"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { trackEvent } from "@/lib/analytics"

type XpAnimationPayload = {
  amount: number
  id: number
}

type XpAnimationContextType = {
  xpAnimation: XpAnimationPayload | null
  triggerXpAnimation: (amount: number) => void
}

const XpAnimationContext = createContext<XpAnimationContextType | undefined>(
  undefined
)

export function XpAnimationProvider({ children }: { children: ReactNode }) {
  const [xpAnimation, setXpAnimation] = useState<XpAnimationPayload | null>(null)

  const triggerXpAnimation = (amount: number) => {
    trackEvent("xp_earned", {
      amount,
    })

    setXpAnimation({
      amount,
      id: Date.now(),
    })

    setTimeout(() => {
      setXpAnimation(null)
    }, 1200)
  }

  return (
    <XpAnimationContext.Provider
      value={{ xpAnimation, triggerXpAnimation }}
    >
      {children}
    </XpAnimationContext.Provider>
  )
}

export function useXpAnimation() {
  const context = useContext(XpAnimationContext)
  if (!context) {
    throw new Error("useXpAnimation must be used inside XpAnimationProvider")
  }
  return context
}