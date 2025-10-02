"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, MapPin, Plus, Loader2, Image as ImageIcon, Calendar } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/ui/file-upload"

const nestBoxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive", "maintenance_needed", "removed"]).default("active"),
  installation_date: z.string().min(1, "Installation date is required"),
  latitude: z.string().regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/, "Invalid latitude"),
  longitude: z.string().regex(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/, "Invalid longitude"),
  
  // Optional fields
  box_type: z.enum(["standard", "bluebird", "wren", "chickadee", "platform"]).default("standard").optional(),
  entrance_hole_size: z.string().optional(),
  floor_dimensions: z.string().optional(),
  height_from_ground: z.string().optional(),
  facing_direction: z.string().optional(),
  habitat_type: z.string().optional(),
  installer_name: z.string().optional(),
  monitoring_frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).default("weekly").optional(),
  photo_url: z.string().optional(),
  description: z.string().optional(),
  accessibility_notes: z.string().optional(),
})

type NestBoxFormValues = z.infer<typeof nestBoxSchema>

export default function AddNestBoxPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NestBoxFormValues>({
    resolver: zodResolver(nestBoxSchema),
    defaultValues: {
      status: "active",
      box_type: "standard",
      monitoring_frequency: "weekly"
    },
  })

  const currentStatus = watch("status")
  const currentBoxType = watch("box_type")
  const monitoringFrequency = watch("monitoring_frequency")

  const handleFileUpload = async (file: File) => {
    if (!file) return
    
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `nest-boxes/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('nestbox-images')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('nestbox-images')
        .getPublicUrl(filePath)
      
      setValue('photo_url', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Upload failed",
        description: "Could not upload the image. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: NestBoxFormValues) => {
    try {
      setIsLoading(true)
      
      // If there's a file being uploaded, wait for it to complete
      if (data.photo_url?.startsWith('data:')) {
        const file = await fetch(data.photo_url).then(res => res.blob())
        const url = await handleFileUpload(new File([file], 'image.jpg'))
        if (!url) return
        data.photo_url = url
      }
      
      const { data: result, error } = await supabase
        .from("nest_boxes")
        .insert([
          {
            name: data.name,
            status: data.status,
            installation_date: data.installation_date,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            box_type: data.box_type,
            entrance_hole_size: data.entrance_hole_size ? parseFloat(data.entrance_hole_size) : null,
            floor_dimensions: data.floor_dimensions || null,
            height_from_ground: data.height_from_ground ? parseFloat(data.height_from_ground) : null,
            facing_direction: data.facing_direction || null,
            habitat_type: data.habitat_type || null,
            installer_name: data.installer_name || null,
            monitoring_frequency: data.monitoring_frequency,
            photo_url: data.photo_url || null,
            description: data.description || null,
            accessibility_notes: data.accessibility_notes || null,
          },
        ])
        .select()

      if (error) {
        console.error("Database error details:", error)
        throw new Error(error.message || "Failed to add nest box. Please check the console for details.")
      }

      toast({
        title: "Success!",
        description: "Nest box has been added and is pending approval.",
      })

      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error in onSubmit:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      toast({
        title: "Error",
        description: `Failed to add nest box: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude.toString(), { shouldValidate: true })
          setValue("longitude", position.coords.longitude.toString(), { shouldValidate: true })
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please enter the coordinates manually.",
            variant: "destructive",
          })
        }
      )
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation. Please enter the coordinates manually.",
        variant: "destructive",
      })
    }
  }

  const boxTypes = [
    { value: "standard", label: "Standard" },
    { value: "bluebird", label: "Bluebird" },
    { value: "wren", label: "Wren" },
    { value: "chickadee", label: "Chickadee" },
    { value: "platform", label: "Platform" },
  ]

  const directions = [
    { value: "north", label: "North" },
    { value: "northeast", label: "Northeast" },
    { value: "east", label: "East" },
    { value: "southeast", label: "Southeast" },
    { value: "south", label: "South" },
    { value: "southwest", label: "Southwest" },
    { value: "west", label: "West" },
    { value: "northwest", label: "Northwest" },
  ]

  const habitatTypes = [
    { value: "woodland", label: "Woodland" },
    { value: "grassland", label: "Grassland" },
    { value: "wetland", label: "Wetland" },
    { value: "urban", label: "Urban" },
    { value: "suburban", label: "Suburban" },
    { value: "rural", label: "Rural" },
    { value: "park", label: "Park" },
    { value: "garden", label: "Garden" },
    { value: "farmland", label: "Farmland" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Add New Nest Box</h1>
        <p className="text-muted-foreground">
          Add a new nest box to the monitoring system. All submissions require admin approval.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Required Information */}
        <Card>
          <CardHeader>
            <CardTitle>Required Information</CardTitle>
            <CardDescription>Please fill in all required fields marked with *</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Meadow Box A"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("status", value as NestBoxFormValues["status"])
                  }
                  value={currentStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance_needed">Maintenance</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installation_date">Installation Date *</Label>
                <Input
                  id="installation_date"
                  type="date"
                  {...register("installation_date")}
                />
                {errors.installation_date && (
                  <p className="text-sm text-red-500">{errors.installation_date.message}</p>
                )}
              </div>
            </div>

            {/* Location Row */}
            <div className="space-y-2">
              <Label>Location *</Label>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                  <Input
                    id="latitude"
                    placeholder="e.g., 37.7749"
                    {...register("latitude")}
                  />
                  {errors.latitude && (
                    <p className="text-xs text-red-500">{errors.latitude.message}</p>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label>
                  <Input
                    id="longitude"
                    placeholder="e.g., -122.4194"
                    {...register("longitude")}
                  />
                  {errors.longitude && (
                    <p className="text-xs text-red-500">{errors.longitude.message}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={getCurrentLocation}
                  title="Use current location"
                  className="h-10 w-10"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Photo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
            <CardDescription>Upload a photo of the nest box (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelected={async (file) => {
                if (file) {
                  const url = await handleFileUpload(file)
                  if (url) setValue('photo_url', url)
                } else {
                  setValue('photo_url', '')
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Section 3: Optional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Optional Information</CardTitle>
            <CardDescription>Additional details about the nest box</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="box_type">Box Type</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("box_type", value as NestBoxFormValues["box_type"])
                  }
                  value={currentBoxType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select box type" />
                  </SelectTrigger>
                  <SelectContent>
                    {boxTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entrance_hole_size">Entrance Hole Size</Label>
                <div className="relative">
                  <Input
                    id="entrance_hole_size"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 3.2"
                    {...register("entrance_hole_size")}
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">cm</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor_dimensions">Floor Dimensions</Label>
                <Input
                  id="floor_dimensions"
                  placeholder="e.g., 10x12"
                  {...register("floor_dimensions")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height_from_ground">Height From Ground</Label>
                <div className="relative">
                  <Input
                    id="height_from_ground"
                    type="number"
                    placeholder="e.g., 150"
                    {...register("height_from_ground")}
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">cm</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facing_direction">Facing Direction</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("facing_direction", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {directions.map((dir) => (
                      <SelectItem key={dir.value} value={dir.value}>
                        {dir.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="habitat_type">Habitat Type</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("habitat_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select habitat type" />
                  </SelectTrigger>
                  <SelectContent>
                    {habitatTypes.map((habitat) => (
                      <SelectItem key={habitat.value} value={habitat.value}>
                        {habitat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monitoring_frequency">Monitoring Frequency</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("monitoring_frequency", value as NestBoxFormValues["monitoring_frequency"])
                  }
                  value={monitoringFrequency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installer_name">Installer Name</Label>
                <Input
                  id="installer_name"
                  placeholder="e.g., John Doe"
                  {...register("installer_name")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Any additional notes or descriptions (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a description of the nest box location and features..."
                className="min-h-[100px]"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessibility_notes">Accessibility Notes</Label>
              <Textarea
                id="accessibility_notes"
                placeholder="Any notes about accessing this nest box (e.g., 'Behind the shed, requires a ladder')"
                className="min-h-[100px]"
                {...register("accessibility_notes")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.href = "/dashboard"
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || uploading}>
            {(isLoading || uploading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Submit Nest Box
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
