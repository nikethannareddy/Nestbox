"use client"

import { DatabaseTest } from "@/components/database-test"

export default function TestDatabasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="border-b border-emerald-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-emerald-900">Database Testing</h1>
              <p className="text-sm text-emerald-700">Test database connections and schema integrity</p>
            </div>
            <a href="/" className="text-emerald-600 hover:text-emerald-800 transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DatabaseTest />
      </main>
    </div>
  )
}
