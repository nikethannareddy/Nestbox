export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          role: "volunteer" | "admin" | "sponsor" | "guest"
          bio: string | null
          location: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          volunteer_since: string | null
          total_observations: number
          total_maintenance_tasks: number
          preferred_contact_method: "email" | "phone" | "both"
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          role?: "volunteer" | "admin" | "sponsor" | "guest"
          bio?: string | null
          location?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          volunteer_since?: string | null
          total_observations?: number
          total_maintenance_tasks?: number
          preferred_contact_method?: "email" | "phone" | "both"
          notifications_enabled?: boolean
        }
        Update: {
          full_name?: string
          email?: string
          phone?: string | null
          role?: "volunteer" | "admin" | "sponsor" | "guest"
          bio?: string | null
          location?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          preferred_contact_method?: "email" | "phone" | "both"
          notifications_enabled?: boolean
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
          sponsorship_level: "individual" | "family" | "organization" | "corporate"
          annual_contribution: number | null
          payment_method: string | null
          venmo_handle: string | null
          dedication_message: string | null
          is_memorial: boolean
          memorial_person: string | null
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
          sponsorship_level?: "individual" | "family" | "organization" | "corporate"
          annual_contribution?: number | null
          payment_method?: string | null
          venmo_handle?: string | null
          dedication_message?: string | null
          is_memorial?: boolean
          memorial_person?: string | null
          public_recognition?: boolean
        }
        Update: {
          organization_name?: string | null
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          sponsorship_level?: "individual" | "family" | "organization" | "corporate"
          annual_contribution?: number | null
          payment_method?: string | null
          venmo_handle?: string | null
          dedication_message?: string | null
          is_memorial?: boolean
          memorial_person?: string | null
          public_recognition?: boolean
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
          box_type: "standard" | "bluebird" | "wren" | "chickadee" | "platform"
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
          status: "active" | "inactive" | "maintenance_needed" | "removed"
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
          box_type?: "standard" | "bluebird" | "wren" | "chickadee" | "platform"
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
          status?: "active" | "inactive" | "maintenance_needed" | "removed"
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
          box_type?: "standard" | "bluebird" | "wren" | "chickadee" | "platform"
          entrance_hole_size?: number | null
          floor_dimensions?: string | null
          height_from_ground?: number | null
          facing_direction?: string | null
          habitat_type?: string | null
          target_species?: string[]
          installer_name?: string | null
          sponsor_id?: string | null
          sponsor_message?: string | null
          status?: "active" | "inactive" | "maintenance_needed" | "removed"
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
          visit_duration: number | null
          weather_conditions: string | null
          temperature: number | null
          nest_stage: "empty" | "building" | "eggs" | "chicks" | "fledged" | "abandoned" | null
          species_observed: string | null
          adult_count: number
          egg_count: number
          chick_count: number
          estimated_chick_age: number | null
          behavior_notes: string | null
          predator_evidence: boolean
          predator_type: string | null
          parasites_observed: boolean
          parasite_type: string | null
          nest_material_notes: string | null
          photos: string[]
          maintenance_needed: boolean
          maintenance_type: string | null
          maintenance_notes: string | null
          maintenance_urgency: "low" | "medium" | "high" | "urgent" | null
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
          visit_duration?: number | null
          weather_conditions?: string | null
          temperature?: number | null
          nest_stage?: "empty" | "building" | "eggs" | "chicks" | "fledged" | "abandoned" | null
          species_observed?: string | null
          adult_count?: number
          egg_count?: number
          chick_count?: number
          estimated_chick_age?: number | null
          behavior_notes?: string | null
          predator_evidence?: boolean
          predator_type?: string | null
          parasites_observed?: boolean
          parasite_type?: string | null
          nest_material_notes?: string | null
          photos?: string[]
          maintenance_needed?: boolean
          maintenance_type?: string | null
          maintenance_notes?: string | null
          maintenance_urgency?: "low" | "medium" | "high" | "urgent" | null
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
        }
        Update: {
          observation_date?: string
          visit_duration?: number | null
          weather_conditions?: string | null
          temperature?: number | null
          nest_stage?: "empty" | "building" | "eggs" | "chicks" | "fledged" | "abandoned" | null
          species_observed?: string | null
          adult_count?: number
          egg_count?: number
          chick_count?: number
          estimated_chick_age?: number | null
          behavior_notes?: string | null
          predator_evidence?: boolean
          predator_type?: string | null
          parasites_observed?: boolean
          parasite_type?: string | null
          nest_material_notes?: string | null
          photos?: string[]
          maintenance_needed?: boolean
          maintenance_type?: string | null
          maintenance_notes?: string | null
          maintenance_urgency?: "low" | "medium" | "high" | "urgent" | null
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
          assigned_by: string | null
          assignment_type: "monitoring" | "maintenance" | "installation" | "removal"
          priority: "low" | "medium" | "high" | "urgent"
          description: string | null
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
          assigned_by?: string | null
          assignment_type: "monitoring" | "maintenance" | "installation" | "removal"
          priority?: "low" | "medium" | "high" | "urgent"
          description?: string | null
          assigned_date?: string
          due_date?: string | null
          status?: "assigned" | "in_progress" | "completed" | "cancelled"
          completion_date?: string | null
          completion_notes?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
        }
        Update: {
          assignment_type?: "monitoring" | "maintenance" | "installation" | "removal"
          priority?: "low" | "medium" | "high" | "urgent"
          description?: string | null
          due_date?: string | null
          status?: "assigned" | "in_progress" | "completed" | "cancelled"
          completion_date?: string | null
          completion_notes?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          updated_at?: string
        }
      }
      educational_content: {
        Row: {
          id: string
          title: string
          content_type: "bird_guide" | "building_guide" | "maintenance_guide" | "article" | "video" | "pdf"
          content: string | null
          summary: string | null
          author_id: string | null
          species_focus: string | null
          difficulty_level: "beginner" | "intermediate" | "advanced" | null
          estimated_read_time: number | null
          tags: string[]
          media_urls: string[]
          download_url: string | null
          view_count: number
          is_featured: boolean
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content_type: "bird_guide" | "building_guide" | "maintenance_guide" | "article" | "video" | "pdf"
          content?: string | null
          summary?: string | null
          author_id?: string | null
          species_focus?: string | null
          difficulty_level?: "beginner" | "intermediate" | "advanced" | null
          estimated_read_time?: number | null
          tags?: string[]
          media_urls?: string[]
          download_url?: string | null
          view_count?: number
          is_featured?: boolean
          is_published?: boolean
        }
        Update: {
          title?: string
          content_type?: "bird_guide" | "building_guide" | "maintenance_guide" | "article" | "video" | "pdf"
          content?: string | null
          summary?: string | null
          species_focus?: string | null
          difficulty_level?: "beginner" | "intermediate" | "advanced" | null
          estimated_read_time?: number | null
          tags?: string[]
          media_urls?: string[]
          download_url?: string | null
          view_count?: number
          is_featured?: boolean
          is_published?: boolean
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          type: "maintenance_request" | "assignment" | "observation_update" | "system" | "reminder"
          title: string
          message: string
          related_nest_box_id: string | null
          related_assignment_id: string | null
          is_read: boolean
          is_urgent: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          type: "maintenance_request" | "assignment" | "observation_update" | "system" | "reminder"
          title: string
          message: string
          related_nest_box_id?: string | null
          related_assignment_id?: string | null
          is_read?: boolean
          is_urgent?: boolean
          action_url?: string | null
        }
        Update: {
          is_read?: boolean
          action_url?: string | null
        }
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Record<string, any>
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Record<string, any>
          description?: string | null
          is_public?: boolean
        }
        Update: {
          setting_value?: Record<string, any>
          description?: string | null
          is_public?: boolean
          updated_at?: string
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

// Helper types for easier use
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Sponsor = Database["public"]["Tables"]["sponsors"]["Row"]
export type NestBox = Database["public"]["Tables"]["nest_boxes"]["Row"]
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"]
export type VolunteerAssignment = Database["public"]["Tables"]["volunteer_assignments"]["Row"]
export type EducationalContent = Database["public"]["Tables"]["educational_content"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]
export type SystemSetting = Database["public"]["Tables"]["system_settings"]["Row"]

export type UserRole = Profile["role"]
export type NestBoxStatus = NestBox["status"]
export type NestStage = ActivityLog["nest_stage"]
export type AssignmentStatus = VolunteerAssignment["status"]
export type SponsorshipLevel = Sponsor["sponsorship_level"]
