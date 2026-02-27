"use client"

import { createContext, useContext, useState, ReactNode } from "react"

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
    setXpAnimation({
      amount,
      id: Date.now(), // unique each time
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