"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type XpAnimationContextType = {
  xpAnimationAmount: number | null
  triggerXpAnimation: (amount: number) => void
}

const XpAnimationContext = createContext<XpAnimationContextType | undefined>(
  undefined
)

export function XpAnimationProvider({ children }: { children: ReactNode }) {
  const [xpAnimationAmount, setXpAnimationAmount] = useState<number | null>(null)

  const triggerXpAnimation = (amount: number) => {
    setXpAnimationAmount(amount)

    setTimeout(() => {
      setXpAnimationAmount(null)
    }, 1200)
  }

  return (
    <XpAnimationContext.Provider
      value={{ xpAnimationAmount, triggerXpAnimation }}
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