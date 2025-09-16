"use client"

import { useState } from "react"
import { NestBoxLogo } from "@/components/nestbox-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, Heart, ArrowRight, Calendar, Clock, MapIcon, Menu, Hammer, User, Shield } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const getDashboardUrl = () => {
    if (!user) return "/auth"
    return user.role === "admin" ? "/admin" : "/dashboard"
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/20 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <NestBoxLogo />
            </a>
            <nav className="hidden md:flex items-center gap-2">
              <a href="/map" className="inline-block">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  Explore
                </Button>
              </a>
              <a href="/learn" className="inline-block">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  Build
                </Button>
              </a>
              <a href="/about" className="inline-block">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  About
                </Button>
              </a>
              {isAuthenticated && user?.role === "admin" && (
                <a href="/admin" className="inline-block">
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </a>
              )}
              <div className="h-6 w-px bg-border/40 mx-2"></div>
              {isAuthenticated && user ? (
                <a href={getDashboardUrl()} className="inline-block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 hover:bg-primary/10 font-medium"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.first_name} {user.last_name}
                  </Button>
                </a>
              ) : (
                <a href="/auth" className="inline-block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/30 hover:bg-primary/10 bg-transparent"
                  >
                    Sign In
                  </Button>
                </a>
              )}
            </nav>
            <Button
              className="md:hidden bg-transparent"
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border/20">
              <nav className="flex flex-col gap-2 pt-4">
                <a href="/map" className="inline-block">
                  <Button
                    variant="ghost"
                    className="justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    Explore
                  </Button>
                </a>
                <a href="/nest-check" className="inline-block">
                  <Button
                    variant="ghost"
                    className="justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    Monitor
                  </Button>
                </a>
                <a href="/learn" className="inline-block">
                  <Button
                    variant="ghost"
                    className="justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    Build
                  </Button>
                </a>
                <a href="/about" className="inline-block">
                  <Button
                    variant="ghost"
                    className="justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    About
                  </Button>
                </a>
                {isAuthenticated && user?.role === "admin" && (
                  <a href="/admin" className="inline-block">
                    <Button
                      variant="ghost"
                      className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </a>
                )}
                <div className="border-t border-border/20 my-2"></div>
                {isAuthenticated && user ? (
                  <a href={getDashboardUrl()} className="inline-block">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-primary hover:text-primary/80 hover:bg-primary/10 font-medium"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {user.first_name} {user.last_name}
                    </Button>
                  </a>
                ) : (
                  <a href="/auth" className="inline-block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start border-primary/30 hover:bg-primary/10 bg-transparent"
                    >
                      Sign In
                    </Button>
                  </a>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder-sd3f8.png')] opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              NestBox makes it easy for communities to <span className="text-primary">protect local birds</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              We connect people who care about birds with nest boxes that need monitoring. Together, we're protecting
              birds one box at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href="/auth?mode=signup" className="inline-block">
                <Button size="lg" className="text-lg px-10 py-4 bg-primary hover:bg-primary/90 shadow-lg">
                  <Heart className="mr-2 h-5 w-5" />
                  Join Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="/map" className="inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-4 bg-sky-500/5 hover:bg-sky-500/10 text-sky-600 border-sky-500/30 hover:border-sky-500/50 shadow-lg"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Explore
                </Button>
              </a>
              <a href="/sponsor" className="inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-4 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:border-yellow-500/50 shadow-lg"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Sponsor a Box
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border/20 shadow-lg">
                <div className="text-4xl font-bold text-primary mb-2">12</div>
                <div className="text-base font-medium text-foreground mb-1">New NestBox Installed</div>
                <div className="text-sm text-muted-foreground">(This Season)</div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border/20 shadow-lg">
                <div className="text-4xl font-bold text-primary mb-2">47</div>
                <div className="text-base font-medium text-foreground mb-1">Active NestBox</div>
                <div className="text-sm text-muted-foreground">(All Time)</div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border/20 shadow-lg">
                <div className="text-4xl font-bold text-primary mb-2">23</div>
                <div className="text-base font-medium text-foreground mb-1">Volunteers</div>
                <div className="text-sm text-muted-foreground">(Active Members)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We turn every nest box into a learning opportunity and every community member into a bird protector.
              Building nest boxes, protecting birds, and bringing people together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card
              className="border-border/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 cursor-pointer"
            >
              <a href="/map">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">Explore NestBox</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Discover nest boxes in your area and log activity.
                  </p>
                </CardContent>
              </a>
            </Card>

            <Card
              className="border-border/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 cursor-pointer"
            >
              <a href="/learn">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Hammer className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">Learn & Build</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Access guides about local birds and building nest boxes.
                  </p>
                </CardContent>
              </a>
            </Card>

            <Card
              className="border-border/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 cursor-pointer"
            >
              <a href="/dashboard">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">Volunteer Network</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Join a community of volunteers monitoring nest boxes.
                  </p>
                </CardContent>
              </a>
            </Card>

            <Card
              className="border-border/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 cursor-pointer"
            >
              <a href="/sponsor">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">Sponsor Impact</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Support conservation and honor contributions to local birds.
                  </p>
                </CardContent>
              </a>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">Upcoming Events</h2>
            <p className="text-xl text-muted-foreground">Join us for community events and conservation activities</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/20 bg-card/70 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">September 20, 2025</span>
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2 text-foreground">BUILD A BLUEBIRD BOX</h3>
                <p className="text-muted-foreground mb-4">
                  {"Join Borderland Staff and Keep Sharon Beautiful and help us assemble bluebird boxes! Materials provided. For adults and older children. Rain or shine. Parking fees apply. Meet at Visitor Center."}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{"9:00 AM - 11:00 AM"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapIcon className="h-4 w-4" />
                  <span>{"Borderland State Park"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/20 bg-card/70 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">September 27, 2025</span>
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2 text-foreground">Family Bird Walk</h3>
                <p className="text-muted-foreground mb-4">
                  {"Join us at Tidmarsh Wildlife Sanctuary in Plymouth for a family-friendly bird walk! All skill levels are welcome, this will be a relaxed opportunity for wandering the sanctuary and seeing what feathered friends we can find!"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>10:00 - 11.30 AM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapIcon className="h-4 w-4" />
                  <span>Tidmarsh Wildlife Sanctuary, Plymouth</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/20 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <NestBoxLogo />
            <div className="text-center md:text-right">
              <p className="text-muted-foreground"> 2025 NestBox. Protecting birds, one box at a time.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
