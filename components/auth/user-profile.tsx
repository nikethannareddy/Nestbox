"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, Calendar, Award, MapPin, Camera, Settings, Shield, Heart, Users, Crown } from "lucide-react"

const roleIcons = {
  volunteer: <Users className="h-4 w-4" />,
  sponsor: <Heart className="h-4 w-4" />,
  admin: <Crown className="h-4 w-4" />,
  guest: <User className="h-4 w-4" />,
}

const roleColors = {
  volunteer: "bg-blue-100 text-blue-800",
  sponsor: "bg-green-100 text-green-800",
  admin: "bg-purple-100 text-purple-800",
  guest: "bg-gray-100 text-gray-800",
}

interface UserProfileProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    joinDate: string
    avatar?: string
    phone?: string
    bio?: string
    location?: string
    stats?: {
      observations: number
      nestBoxesSponsored: number
      volunteersManaged: number
      contributionHours: number
    }
  }
  onUpdateProfile: (updatedUser: any) => void
}

export function UserProfile({ user, onUpdateProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || "",
    bio: user.bio || "",
    location: user.location || "",
  })

  const handleSave = () => {
    onUpdateProfile({ ...user, ...editData })
    setIsEditing(false)
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      volunteer: "Volunteer",
      sponsor: "Sponsor",
      admin: "Administrator",
      guest: "Guest",
    }
    return labels[role as keyof typeof labels] || "User"
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-lg">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-serif text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                  <span className="flex items-center gap-1">
                    {roleIcons[user.role as keyof typeof roleIcons]}
                    {getRoleLabel(user.role)}
                  </span>
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              {user.bio && <p className="mt-3 text-sm">{user.bio}</p>}
            </div>

            <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="bg-transparent">
              <Settings className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          {user.stats && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user.role === "volunteer" && (
                <>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-2xl mb-1">{user.stats.observations}</h3>
                      <p className="text-sm text-muted-foreground">Observations Logged</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-2xl mb-1">{user.stats.contributionHours}</h3>
                      <p className="text-sm text-muted-foreground">Volunteer Hours</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {user.role === "sponsor" && (
                <>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-2xl mb-1">{user.stats.nestBoxesSponsored}</h3>
                      <p className="text-sm text-muted-foreground">Nest Boxes Sponsored</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-2xl mb-1">$2,450</h3>
                      <p className="text-sm text-muted-foreground">Total Contributions</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {user.role === "admin" && (
                <>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-2xl mb-1">{user.stats.volunteersManaged}</h3>
                      <p className="text-sm text-muted-foreground">Volunteers Managed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-2xl mb-1">47</h3>
                      <p className="text-sm text-muted-foreground">Nest Boxes Managed</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Award className="h-4 w-4 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Logged observation at Oak Grove Box #1</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed volunteer training module</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Heart className="h-4 w-4 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Joined NestBox community</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Activity tracking coming soon</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed activity history and contribution tracking will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-firstName">First Name</Label>
                      <Input
                        id="edit-firstName"
                        value={editData.firstName}
                        onChange={(e) => setEditData((prev) => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-lastName">Last Name</Label>
                      <Input
                        id="edit-lastName"
                        value={editData.lastName}
                        onChange={(e) => setEditData((prev) => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={editData.phone}
                      onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={editData.location}
                      onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-bio">Bio</Label>
                    <Input
                      id="edit-bio"
                      value={editData.bio}
                      onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Profile settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">Click "Edit Profile" to update your information.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
