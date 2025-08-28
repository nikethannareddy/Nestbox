"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ActivityPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/nest-check")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">Taking you to the new Nest Check system</p>
      </div>
    </div>
  )
}
