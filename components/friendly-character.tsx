"use client"

export function FriendlyCharacter() {
  return (
    <div className="relative">
      <div className="w-64 h-80 relative">
        {/* Character body */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-40 bg-gradient-to-b from-primary/20 to-accent/20 rounded-full" />

        {/* Character head */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full">
          {/* Eyes */}
          <div className="absolute top-6 left-5 w-2 h-2 bg-foreground/60 rounded-full" />
          <div className="absolute top-6 right-5 w-2 h-2 bg-foreground/60 rounded-full" />
          {/* Smile */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-4 border-b-2 border-foreground/40 rounded-full" />
        </div>

        {/* Arms */}
        <div className="absolute top-20 left-8 w-6 h-16 bg-gradient-to-b from-primary/20 to-accent/20 rounded-full transform rotate-12" />
        <div className="absolute top-20 right-8 w-6 h-16 bg-gradient-to-b from-primary/20 to-accent/20 rounded-full transform -rotate-12" />

        {/* Floating elements around character */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse-soft" />
        <div className="absolute top-12 -right-6 w-6 h-6 bg-accent/20 rounded-full animate-float" />
        <div className="absolute bottom-16 -left-8 w-10 h-10 bg-chart-3/20 rounded-full animate-pulse-soft" />
      </div>
    </div>
  )
}
