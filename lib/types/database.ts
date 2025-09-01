export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string
          full_name: string | null
          profile_picture: string | null
          bio: string | null
          role: "volunteer" | "admin"
          phone: string | null
          location: string | null
          notifications_enabled: boolean
          preferred_contact_method: "email" | "phone" | "both"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email: string
          full_name?: string | null
          profile_picture?: string | null
          bio?: string | null
          role?: "volunteer" | "admin"
          phone?: string | null
          location?: string | null
          notifications_enabled?: boolean
          preferred_contact_method?: "email" | "phone" | "both"
        }
        Update: {
          username?: string | null
          email?: string
          full_name?: string | null
          profile_picture?: string | null
          bio?: string | null
          role?: "volunteer" | "admin"
          phone?: string | null
          location?: string | null
          notifications_enabled?: boolean
          preferred_contact_method?: "email" | "phone" | "both"
          updated_at?: string
        }
      }
      nest_boxes: {
        Row: {
          id: string
          name: string
          description: string | null
          latitude: number
          longitude: number
          location_description: string | null
          box_type: "standard" | "platform" | "specialty"
          target_species: string[]
          installation_date: string
          installer_name: string | null
          status: "active" | "inactive" | "maintenance" | "removed"
          last_maintenance: string | null
          maintenance_notes: string | null
          qr_code: string | null
          sponsor_id: string | null
          sponsor_message: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          latitude: number
          longitude: number
          location_description?: string | null
          box_type?: "standard" | "platform" | "specialty"
          target_species?: string[]
          installation_date?: string
          installer_name?: string | null
          status?: "active" | "inactive" | "maintenance" | "removed"
          last_maintenance?: string | null
          maintenance_notes?: string | null
          qr_code?: string | null
          sponsor_id?: string | null
          sponsor_message?: string | null
          photo_url?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          latitude?: number
          longitude?: number
          location_description?: string | null
          box_type?: "standard" | "platform" | "specialty"
          target_species?: string[]
          installer_name?: string | null
          status?: "active" | "inactive" | "maintenance" | "removed"
          last_maintenance?: string | null
          maintenance_notes?: string | null
          qr_code?: string | null
          sponsor_id?: string | null
          sponsor_message?: string | null
          photo_url?: string | null
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          nest_box_id: string
          volunteer_id: string
          observation_date: string
          species_observed: string | null
          nest_stage: "empty" | "building" | "eggs" | "chicks" | "fledged" | null
          adult_count: number
          egg_count: number
          chick_count: number
          weather_conditions: string | null
          temperature: number | null
          maintenance_needed: boolean
          maintenance_type: string | null
          maintenance_urgency: "low" | "medium" | "high" | "urgent" | null
          notes: string | null
          photos: string[]
          verified: boolean
          verified_by: string | null
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nest_box_id: string
          volunteer_id: string
          observation_date?: string
          species_observed?: string | null
          nest_stage?: "empty" | "building" | "eggs" | "chicks" | "fledged" | null
          adult_count?: number
          egg_count?: number
          chick_count?: number
          weather_conditions?: string | null
          temperature?: number | null
          maintenance_needed?: boolean
          maintenance_type?: string | null
          maintenance_urgency?: "low" | "medium" | "high" | "urgent" | null
          notes?: string | null
          photos?: string[]
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
        }
        Update: {
          observation_date?: string
          species_observed?: string | null
          nest_stage?: "empty" | "building" | "eggs" | "chicks" | "fledged" | null
          adult_count?: number
          egg_count?: number
          chick_count?: number
          weather_conditions?: string | null
          temperature?: number | null
          maintenance_needed?: boolean
          maintenance_type?: string | null
          maintenance_urgency?: "low" | "medium" | "high" | "urgent" | null
          notes?: string | null
          photos?: string[]
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
        }
      }
      volunteer_assignments: {
        Row: {
          id: string
          nest_box_id: string
          volunteer_id: string
          assigned_by: string
          assignment_type: "maintenance" | "monitoring" | "installation" | "removal"
          description: string
          priority: "low" | "medium" | "high" | "urgent"
          assigned_date: string
          due_date: string | null
          status: "assigned" | "in_progress" | "completed" | "cancelled"
          completion_date: string | null
          completion_notes: string | null
          estimated_hours: number | null
          actual_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nest_box_id: string
          volunteer_id: string
          assigned_by: string
          assignment_type: "maintenance" | "monitoring" | "installation" | "removal"
          description: string
          priority?: "low" | "medium" | "high" | "urgent"
          assigned_date?: string
          due_date?: string | null
          status?: "assigned" | "in_progress" | "completed" | "cancelled"
          completion_date?: string | null
          completion_notes?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
        }
        Update: {
          assignment_type?: "maintenance" | "monitoring" | "installation" | "removal"
          description?: string
          priority?: "low" | "medium" | "high" | "urgent"
          due_date?: string | null
          status?: "assigned" | "in_progress" | "completed" | "cancelled"
          completion_date?: string | null
          completion_notes?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          updated_at?: string
        }
      }
      sponsors: {
        Row: {
          id: string
          profile_id: string | null
          organization_name: string | null
          contact_person: string | null
          contact_email: string | null
          contact_phone: string | null
          sponsorship_level: "basic" | "premium" | "corporate"
          annual_contribution: number | null
          is_memorial: boolean
          memorial_person: string | null
          dedication_message: string | null
          payment_method: "venmo" | "check" | "cash" | "online" | null
          venmo_handle: string | null
          public_recognition: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          organization_name?: string | null
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          sponsorship_level?: "basic" | "premium" | "corporate"
          annual_contribution?: number | null
          is_memorial?: boolean
          memorial_person?: string | null
          dedication_message?: string | null
          payment_method?: "venmo" | "check" | "cash" | "online" | null
          venmo_handle?: string | null
          public_recognition?: boolean
        }
        Update: {
          organization_name?: string | null
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          sponsorship_level?: "basic" | "premium" | "corporate"
          annual_contribution?: number | null
          is_memorial?: boolean
          memorial_person?: string | null
          dedication_message?: string | null
          payment_method?: "venmo" | "check" | "cash" | "online" | null
          venmo_handle?: string | null
          public_recognition?: boolean
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          type: "maintenance" | "assignment" | "observation" | "system" | "welcome"
          title: string
          message: string
          related_nest_box_id: string | null
          related_assignment_id: string | null
          action_url: string | null
          is_read: boolean
          is_urgent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          type: "maintenance" | "assignment" | "observation" | "system" | "welcome"
          title: string
          message: string
          related_nest_box_id?: string | null
          related_assignment_id?: string | null
          action_url?: string | null
          is_read?: boolean
          is_urgent?: boolean
        }
        Update: {
          is_read?: boolean
          action_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type NestBox = Database["public"]["Tables"]["nest_boxes"]["Row"]
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"]
export type VolunteerAssignment = Database["public"]["Tables"]["volunteer_assignments"]["Row"]
export type Sponsor = Database["public"]["Tables"]["sponsors"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]

export type UserRole = Profile["role"]
export type NestBoxStatus = NestBox["status"]
export type NestStage = ActivityLog["nest_stage"]
export type AssignmentStatus = VolunteerAssignment["status"]

export type UserProfile = Profile
