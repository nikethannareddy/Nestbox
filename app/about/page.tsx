import { NestBoxLogo } from "@/components/nestbox-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, TreePine, Users, Heart, MapPin, BookOpen, Camera } from "lucide-react"
import { AppHeader } from "@/components/layout/header"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
              About <span className="text-primary">NestBox</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A student-led initiative bringing communities together to protect local birds
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                NestBox was founded by Ashika Reddy, a high school student who noticed fewer birds in her community and
                felt compelled to act. Starting with a handful of birdhouses near the new Costco area, she soon realized
                the project could become something bigger — a way to unite the community around bird conservation.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                That idea became NestBox: a platform where people can install, track, and care for nest boxes while
                learning about the birds that depend on them. Today, NestBox brings together volunteers, families, and
                partners to give birds safe homes and prove that small actions can add up to big impact — one box at a
                time.
              </p>
            </div>
            <div className="bg-card/50 rounded-lg p-8 border border-border/20">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">From Idea to Impact</h3>
                <p className="text-muted-foreground">
                  NestBox shows that small ideas — and young people — can bring communities together for conservation
                </p>
                <div className="text-sm text-primary font-medium mt-4">- Ashika, Founder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-6">How NestBox Works</h2>
            <p className="text-xl text-muted-foreground">
              A simple, technology-enabled approach to community bird conservation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-border/20 hover:shadow-xl transition-all duration-300 bg-card/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">1. Find Nest Boxes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Use our interactive map to discover nest boxes in Sharon. Each box has a unique QR code for easy
                  identification.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/20 hover:shadow-xl transition-all duration-300 bg-card/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">2. Monitor & Log</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Scan QR codes to quickly log bird activity. Record species, nesting stages, and maintenance needs with
                  our simple mobile interface.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/20 hover:shadow-xl transition-all duration-300 bg-card/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">3. Learn & Share</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access educational resources about local birds and share your observations with the community to track
                  conservation progress.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">Community Impact</h2>
            <p className="text-xl text-muted-foreground">
              See how our volunteers are making a difference in Sharon's bird conservation efforts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-border/20 bg-card/70 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Recent Success</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  "Box #23 had a successful Eastern Bluebird family with 4 fledglings this season!"
                </p>
                <div className="text-sm text-muted-foreground">- Sarah M., Volunteer</div>
              </CardContent>
            </Card>

            <Card className="border-border/20 bg-card/70 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TreePine className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Conservation Win</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  "Thanks to community monitoring, we've seen a 40% increase in successful nests this year."
                </p>
                <div className="text-sm text-muted-foreground">- Conservation Team</div>
              </CardContent>
            </Card>

            <Card className="border-border/20 bg-card/70 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Community Growth</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  "It's amazing to see neighbors coming together to help our local bird population thrive."
                </p>
                <div className="text-sm text-muted-foreground">- Mike R., Sponsor</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">47</div>
              <div className="text-sm text-muted-foreground">Active Nest Boxes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">23</div>
              <div className="text-sm text-muted-foreground">Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">156</div>
              <div className="text-sm text-muted-foreground">Birds Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">89</div>
              <div className="text-sm text-muted-foreground">Successful Nests</div>
            </div>
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
