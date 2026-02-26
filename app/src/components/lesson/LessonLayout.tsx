"use client"

import { ReactNode } from "react"

interface LessonLayoutProps {
  left: ReactNode
  right: ReactNode
}

export function LessonLayout({ left, right }: LessonLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-160px)]">
      
      {/* Left Side — Lesson Content */}
      <div className="w-full lg:w-1/2 border-r lg:border-r overflow-y-auto p-6 lg:p-8">
        <div className="max-w-2xl">
          {left}
        </div>
      </div>

      {/* Right Side — Editor */}
      <div className="w-full lg:w-1/2 bg-muted/30 overflow-y-auto p-6 lg:p-8">
        {right}
      </div>

    </div>
  )
}