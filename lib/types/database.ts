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
          elevation: number | null
          box_type: string
          entrance_hole_size: number | null
          floor_dimensions: string | null
          height_from_ground: number | null
          facing_direction: string | null
          habitat_type: string | null
          target_species: string[]
          installation_date: string | null
          installer_name: string | null
          sponsor_id: string | null
          sponsor_message: string | null
          status: string
          last_maintenance: string | null
          maintenance_notes: string | null
          qr_code: string | null
          photo_url: string | null
          accessibility_notes: string | null
          monitoring_frequency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          latitude: number
          longitude: number
          elevation?: number | null
          box_type?: string
          entrance_hole_size?: number | null
          floor_dimensions?: string | null
          height_from_ground?: number | null
          facing_direction?: string | null
          habitat_type?: string | null
          target_species?: string[]
          installation_date?: string | null
          installer_name?: string | null
          sponsor_id?: string | null
          sponsor_message?: string | null
          status?: string
          last_maintenance?: string | null
          maintenance_notes?: string | null
          qr_code?: string | null
          photo_url?: string | null
          accessibility_notes?: string | null
          monitoring_frequency?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          latitude?: number
          longitude?: number
          elevation?: number | null
          box_type?: string
          entrance_hole_size?: number | null
          floor_dimensions?: string | null
          height_from_ground?: number | null
          facing_direction?: string | null
          habitat_type?: string | null
          target_species?: string[]
          installation_date?: string | null
          installer_name?: string | null
          sponsor_id?: string | null
          sponsor_message?: string | null
          status?: string
          last_maintenance?: string | null
          maintenance_notes?: string | null
          qr_code?: string | null
          photo_url?: string | null
          accessibility_notes?: string | null
          monitoring_frequency?: string | null
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
          maintenance_required: boolean
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
          maintenance_required?: boolean
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
          maintenance_required?: boolean
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
          name: string
          email: string | null
          phone: string | null
          organization: string | null
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
          name: string
          email?: string | null
          phone?: string | null
          organization?: string | null
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
          name?: string
          email?: string | null
          phone?: string | null
          organization?: string | null
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
      sponsorships: {
        Row: {
          id: string
          sponsor_id: string
          nest_box_id: string
          amount: number
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sponsor_id: string
          nest_box_id: string
          amount: number
          start_date?: string
          end_date?: string | null
          is_active?: boolean
        }
        Update: {
          amount?: number
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      educational_content: {
        Row: {
          id: string
          title: string
          content: string
          content_type: "guide" | "tutorial" | "article" | "video"
          category: string
          difficulty_level: "beginner" | "intermediate" | "advanced"
          estimated_read_time: number | null
          featured_image: string | null
          is_published: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          content_type?: "guide" | "tutorial" | "article" | "video"
          category: string
          difficulty_level?: "beginner" | "intermediate" | "advanced"
          estimated_read_time?: number | null
          featured_image?: string | null
          is_published?: boolean
          created_by: string
        }
        Update: {
          title?: string
          content?: string
          content_type?: "guide" | "tutorial" | "article" | "video"
          category?: string
          difficulty_level?: "beginner" | "intermediate" | "advanced"
          estimated_read_time?: number | null
          featured_image?: string | null
          is_published?: boolean
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: "maintenance" | "assignment" | "observation" | "system" | "welcome" | "info"
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
          user_id: string
          type: "maintenance" | "assignment" | "observation" | "system" | "welcome" | "info"
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
export type Sponsorship = Database["public"]["Tables"]["sponsorships"]["Row"]
export type EducationalContent = Database["public"]["Tables"]["educational_content"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]

export type UserRole = Profile["role"]
export type NestBoxStatus = NestBox["status"]
export type NestStage = ActivityLog["nest_stage"]
export type AssignmentStatus = VolunteerAssignment["status"]

export type UserProfile = Profile
