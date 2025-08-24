"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Star, Building, Check, Gift, Users } from "lucide-react"

const sponsorshipTiers = [
  {
    id: "individual",
    name: "Individual Sponsor",
    icon: <Heart className="h-6 w-6" />,
    price: 75,
    duration: "per year",
    description: "Sponsor a single nest box and make a direct impact on local bird conservation",
    features: [
      "Sponsor one nest box for a full year",
      "Digital recognition on nest box map",
      "Quarterly impact reports",
      "Tax-deductible donation receipt",
      "Optional memorial dedication",
    ],
    popular: false,
    color: "border-primary",
  },
  {
    id: "family",
    name: "Family Sponsor",
    icon: <Users className="h-6 w-6" />,
    price: 150,
    duration: "per year",
    description: "Perfect for families who want to make conservation a shared experience",
    features: [
      "Sponsor two nest boxes for a full year",
      "Family name recognition on map",
      "Monthly impact updates",
      "Priority access to volunteer events",
      "Educational materials for children",
      "Custom family dedication plaque",
    ],
    popular: true,
    color: "border-green-500",
  },
  {
    id: "champion",
    name: "Conservation Champion",
    icon: <Star className="h-6 w-6" />,
    price: 300,
    duration: "per year",
    description: "For dedicated conservationists who want maximum impact",
    features: [
      "Sponsor five nest boxes for a full year",
      "Premium recognition on website",
      "Bi-weekly detailed reports",
      "Exclusive champion events",
      "Direct communication with coordinators",
      "Custom engraved recognition plaque",
      "Annual appreciation dinner invitation",
    ],
    popular: false,
    color: "border-blue-500",
  },
  {
    id: "corporate",
    name: "Corporate Partner",
    icon: <Building className="h-6 w-6" />,
    price: 1000,
    duration: "per year",
    description: "Comprehensive partnership for businesses committed to environmental responsibility",
    features: [
      "Sponsor 15+ nest boxes",
      "Company logo on sponsored boxes",
      "Featured corporate partner status",
      "Employee volunteer opportunities",
      "Custom CSR impact reporting",
      "Media recognition opportunities",
      "Annual partnership review meeting",
      "Tax benefits and documentation",
    ],
    popular: false,
    color: "border-purple-500",
  },
]

interface SponsorshipTiersProps {
  onSelectTier: (tier: any, customization: any) => void
}

export function SponsorshipTiers({ onSelectTier }: SponsorshipTiersProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [customization, setCustomization] = useState({
    dedicationType: "",
    dedicationText: "",
    isMemorial: false,
    contactInfo: {
      name: "",
      email: "",
      phone: "",
      company: "",
    },
    preferences: {
      publicRecognition: true,
      emailUpdates: true,
      eventInvitations: true,
    },
  })

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId)
  }

  const handleProceedToPayment = () => {
    const tier = sponsorshipTiers.find((t) => t.id === selectedTier)
    if (tier) {
      onSelectTier(tier, customization)
    }
  }

  const updateCustomization = (field: string, value: any) => {
    setCustomization((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateContactInfo = (field: string, value: string) => {
    setCustomization((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
    }))
  }

  const updatePreferences = (field: string, value: boolean) => {
    setCustomization((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }))
  }

  return (
    <div className="space-y-8">
      {/* Sponsorship Tiers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sponsorshipTiers.map((tier) => (
          <Card
            key={tier.id}
            className={`relative cursor-pointer transition-all hover:shadow-lg ${
              selectedTier === tier.id ? `${tier.color} border-2` : "border-border/50"
            }`}
            onClick={() => handleTierSelect(tier.id)}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white">Most Popular</Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {tier.icon}
              </div>
              <CardTitle className="text-lg">{tier.name}</CardTitle>
              <div className="text-3xl font-bold text-primary">
                ${tier.price}
                <span className="text-sm font-normal text-muted-foreground">/{tier.duration}</span>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>

              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full mt-6 ${selectedTier === tier.id ? "" : "bg-transparent"}`}
                variant={selectedTier === tier.id ? "default" : "outline"}
              >
                {selectedTier === tier.id ? "Selected" : "Select Plan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customization Form */}
      {selectedTier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Customize Your Sponsorship
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sponsor-name">Full Name *</Label>
                  <Input
                    id="sponsor-name"
                    value={customization.contactInfo.name}
                    onChange={(e) => updateContactInfo("name", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsor-email">Email *</Label>
                  <Input
                    id="sponsor-email"
                    type="email"
                    value={customization.contactInfo.email}
                    onChange={(e) => updateContactInfo("email", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsor-phone">Phone</Label>
                  <Input
                    id="sponsor-phone"
                    type="tel"
                    value={customization.contactInfo.phone}
                    onChange={(e) => updateContactInfo("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {selectedTier === "corporate" && (
                  <div className="space-y-2">
                    <Label htmlFor="sponsor-company">Company Name *</Label>
                    <Input
                      id="sponsor-company"
                      value={customization.contactInfo.company}
                      onChange={(e) => updateContactInfo("company", e.target.value)}
                      placeholder="Acme Corporation"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Dedication Options */}
            <div className="space-y-4">
              <h3 className="font-semibold">Dedication Options</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="memorial"
                    checked={customization.isMemorial}
                    onCheckedChange={(checked) => updateCustomization("isMemorial", checked)}
                  />
                  <Label htmlFor="memorial">This is a memorial dedication</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dedication-type">Dedication Type</Label>
                  <Select
                    value={customization.dedicationType}
                    onValueChange={(value) => updateCustomization("dedicationType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dedication type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No dedication</SelectItem>
                      <SelectItem value="personal">Personal dedication</SelectItem>
                      <SelectItem value="memorial">In memory of</SelectItem>
                      <SelectItem value="honor">In honor of</SelectItem>
                      <SelectItem value="family">Family dedication</SelectItem>
                      <SelectItem value="corporate">Corporate recognition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {customization.dedicationType && customization.dedicationType !== "none" && (
                  <div className="space-y-2">
                    <Label htmlFor="dedication-text">Dedication Text</Label>
                    <Textarea
                      id="dedication-text"
                      value={customization.dedicationText}
                      onChange={(e) => updateCustomization("dedicationText", e.target.value)}
                      placeholder="Enter the text for your dedication plaque (max 100 characters)"
                      maxLength={100}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {customization.dedicationText.length}/100 characters
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold">Communication Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public-recognition"
                    checked={customization.preferences.publicRecognition}
                    onCheckedChange={(checked) => updatePreferences("publicRecognition", checked as boolean)}
                  />
                  <Label htmlFor="public-recognition">Include my name in public recognition</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-updates"
                    checked={customization.preferences.emailUpdates}
                    onCheckedChange={(checked) => updatePreferences("emailUpdates", checked as boolean)}
                  />
                  <Label htmlFor="email-updates">Send me regular impact updates via email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="event-invitations"
                    checked={customization.preferences.eventInvitations}
                    onCheckedChange={(checked) => updatePreferences("eventInvitations", checked as boolean)}
                  />
                  <Label htmlFor="event-invitations">Invite me to sponsor appreciation events</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button
                onClick={handleProceedToPayment}
                className="flex-1"
                disabled={!customization.contactInfo.name || !customization.contactInfo.email}
              >
                Proceed to Payment
              </Button>
              <Button variant="outline" onClick={() => setSelectedTier(null)} className="bg-transparent">
                Back to Tiers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
