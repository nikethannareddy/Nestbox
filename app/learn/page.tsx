import { EducationalContent } from "@/components/educational-content"
import { AppHeader } from "@/components/layout/header"

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <EducationalContent />
      </main>
    </div>
  )
}
