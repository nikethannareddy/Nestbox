export function NestBoxLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <svg viewBox="0 0 32 32" className="h-8 w-8 text-primary" fill="currentColor">
          {/* Nest box house shape */}
          <path d="M16 2L6 10v18h20V10L16 2z" className="fill-primary" />
          {/* Entrance hole */}
          <circle cx="16" cy="16" r="3" className="fill-background" />
          {/* Roof detail */}
          <path d="M4 10L16 0L28 10L26 8L16 2L6 8z" className="fill-secondary" />
          {/* Perch */}
          <rect x="14" y="22" width="4" height="1" className="fill-secondary" />
        </svg>
      </div>
      <span className="font-serif text-xl font-bold text-foreground">NestBox</span>
    </div>
  )
}
