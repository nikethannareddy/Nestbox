"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Leaf } from "lucide-react"

const partners = [
  { name: "Sharon Conservation Department", logo: "/placeholder.svg" },
  { name: "Sharon Friends of Conservation", logo: "/placeholder.svg" },
  { name: "Borderland State Park", logo: "/placeholder.svg" },
  { name: "Costco", logo: "/placeholder.svg" },
  { name: "Eversource", logo: "/placeholder.svg" },
]

export default function SponsorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="border-b border-emerald-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-emerald-900">Sponsor NestBox</h1>
              <p className="text-sm text-emerald-700">Support local bird conservation</p>
            </div>
            <a href="/" className="text-emerald-600 hover:text-emerald-800 transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-emerald-900 flex items-center justify-center gap-3">
                <Leaf className="w-8 h-8 text-emerald-600" />
                $75 / year
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-emerald-700">
                Your name, family name, organization, or a dedication "In Memory Of" added to a nest box
              </p>

              <ul className="space-y-3 text-left max-w-md mx-auto">
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-emerald-700">Quarterly activity updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-emerald-700">Direct contribution to bird conservation</span>
                </li>
              </ul>

              <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                <p className="text-lg font-semibold text-emerald-900 mb-4">👉 Send via Venmo: @NestBox</p>
                <p className="text-emerald-700 mb-4">
                  Include in note: "NestBox Sponsorship – [Your Name / Dedication]"
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-emerald-700 text-center">
            💚 Every sponsorship creates a safe nesting site for birds. We'll contact you within 24 hours to confirm
            your details.
          </p>
        </div>

        <Card className="mt-12 border-emerald-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-emerald-900 text-2xl">Our Community Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
              {partners.map((partner, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                    <img
                      src={partner.logo || "/placeholder.svg"}
                      alt={partner.name}
                      className="w-16 h-16 object-contain opacity-70"
                    />
                  </div>
                  <p className="text-sm text-emerald-700 font-medium">{partner.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
