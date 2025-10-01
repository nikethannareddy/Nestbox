"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, MapPin, Plus, Loader2 } from "lucide-react"
import Link from "next/link"

const nestBoxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  latitude: z.string().regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/, "Invalid latitude"),
  longitude: z.string().regex(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/, "Invalid longitude"),
  status: z.enum(["active", "inactive", "maintenance", "retired"]),
  installation_date: z.string().optional(),
  last_maintenance_date: z.string().optional(),
  notes: z.string().optional(),
})

type NestBoxFormValues = z.infer<typeof nestBoxSchema>

export default function VolunteerAddNestBoxPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NestBoxFormValues>({
    resolver: zodResolver(nestBoxSchema),
    defaultValues: {
      status: "active",
    },
  })

  const currentStatus = watch("status")

  const onSubmit = async (data: NestBoxFormValues) => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("You must be logged in to add a nest box")
      }

      // Insert the new nest box with pending_review status
      const { data: result, error } = await supabase
        .from('nest_boxes')
        .insert([
          { 
            name: data.name,
            description: data.description,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            status: 'pending_review', // Always set to pending_review for volunteer submissions
            installation_date: data.installation_date || null,
            last_maintenance: data.last_maintenance_date || null,
            notes: data.notes,
            created_by: user.id,
          }
        ])
        .select()

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      toast({
        title: "Success!",
        description: "Nest box has been submitted for admin approval.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error adding nest box:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add nest box. Please try again.",
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Add New Nest Box</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details below to submit a new nest box for admin approval.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nest Box Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Park Avenue Box #1"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a brief description of this nest box"
                {...register("description")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="latitude"
                    placeholder="e.g., 42.3601"
                    {...register("latitude")}
                    className={errors.latitude ? "border-destructive" : ""}
                  />
                </div>
                {errors.latitude && (
                  <p className="text-sm text-destructive mt-1">{errors.latitude.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="longitude"
                    placeholder="e.g., -71.0589"
                    {...register("longitude")}
                    className={errors.longitude ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={getCurrentLocation}
                    title="Use current location"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                {errors.longitude && (
                  <p className="text-sm text-destructive mt-1">{errors.longitude.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value: NestBoxFormValues["status"]) => setValue("status", value, { shouldValidate: true })}
                  value={currentStatus}
                  disabled={true}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Needs Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Status will be set to 'Pending Review'</p>
              </div>

              <div>
                <Label htmlFor="installation_date">Installation Date</Label>
                <Input
                  id="installation_date"
                  type="date"
                  {...register("installation_date")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="last_maintenance_date">Last Maintenance Date</Label>
              <Input
                id="last_maintenance_date"
                type="date"
                {...register("last_maintenance_date")}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this nest box"
                {...register("notes")}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
