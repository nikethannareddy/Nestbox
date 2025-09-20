// Type definitions for global objects and modules

// Google Maps type definitions
declare global {
  interface Window {
    google: typeof google;
  }
}

// Profile type to match your database schema
type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  bio?: string;
  location?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  volunteer_since?: string;
  total_observations?: number;
  total_maintenance_tasks?: number;
  preferred_contact_method?: string;
  notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
};

export {};
