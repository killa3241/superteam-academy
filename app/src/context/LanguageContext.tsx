"use client"

import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "pt" | "es"

type Dictionary = Record<string, string>

const LanguageContext = createContext<{
  language: Language
  setLanguage: (l: Language) => void
  t: (key: string) => string
}>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [dictionary, setDictionary] = useState<Dictionary>({})

  useEffect(() => {
    async function loadLanguage() {
      const dict = await import(`@/languages/${language}.json`)
      setDictionary(dict.default)
    }

    loadLanguage()
  }, [language])

  const t = (key: string) => {
    return dictionary[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)