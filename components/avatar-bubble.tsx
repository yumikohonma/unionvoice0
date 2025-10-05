"use client"

import { useState, useEffect } from "react"

interface AvatarBubbleProps {
  isAnimating: boolean
}

export function AvatarBubble({ isAnimating }: AvatarBubbleProps) {
  const [mouthOpen, setMouthOpen] = useState(false)

  useEffect(() => {
    if (isAnimating) {
      setMouthOpen(true)
      const timer = setTimeout(() => {
        setMouthOpen(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  return (
    <div className="w-48 h-48 bg-card rounded-lg border border-border p-4 flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120" className="text-primary">
        {/* Face circle */}
        <circle cx="60" cy="60" r="50" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" />

        {/* Eyes */}
        <circle cx="45" cy="45" r="3" fill="currentColor" />
        <circle cx="75" cy="45" r="3" fill="currentColor" />

        {/* Mouth */}
        {mouthOpen ? (
          <ellipse cx="60" cy="75" rx="8" ry="12" fill="currentColor" />
        ) : (
          <path d="M 52 75 Q 60 82 68 75" stroke="currentColor" strokeWidth="2" fill="none" />
        )}
      </svg>
    </div>
  )
}
