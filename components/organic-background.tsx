"use client"

export function OrganicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-20 left-10 w-64 h-64 organic-blob animate-float" style={{ animationDelay: "0s" }} />
      <div
        className="absolute top-40 right-20 w-48 h-48 organic-blob-2 animate-pulse-soft"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-32 left-1/4 w-56 h-56 organic-blob animate-float"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute bottom-20 right-1/3 w-40 h-40 organic-blob-2 animate-pulse-soft"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-72 h-72 organic-blob animate-float"
        style={{ animationDelay: "3s", transform: "translate(-50%, -50%)" }}
      />
    </div>
  )
}
