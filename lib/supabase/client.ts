// Mock Supabase client interface
interface MockSupabaseClient {
  auth: {
    signUp: (options: any) => Promise<{ data: any; error: any }>
    signInWithPassword: (options: any) => Promise<{ data: any; error: any }>
    signOut: () => Promise<{ error: any }>
    getUser: () => Promise<{ data: { user: any }; error: any }>
    getSession: () => Promise<{ data: { session: any }; error: any }>
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      data: { subscription: { unsubscribe: () => void } }
    }
  }
  from: (table: string) => {
    select: (columns?: string) => any
    insert: (data: any) => any
    update: (data: any) => any
    delete: () => any
    eq: (column: string, value: any) => any
    single: () => any
    order: (column: string, options?: { ascending?: boolean }) => any
  }
}

// Mock user database - simulates persistent storage
const mockUsers: Record<string, any> = {
  "admin@nestbox.app": {
    id: "admin-user-id",
    email: "admin@nestbox.app",
    user_metadata: { full_name: "Admin User", role: "admin" },
    profile: {
      id: "admin-profile-id",
      user_id: "admin-user-id",
      email: "admin@nestbox.app",
      first_name: "Admin",
      last_name: "User",
      role: "admin",
      phone: null,
      bio: null,
      location: null,
      total_observations: 0,
      total_maintenance_tasks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
}

const updateUserRole = (userId: string, newRole: string) => {
  // Find user by user_id and update role
  const userEntry = Object.values(mockUsers).find((user: any) => user.profile?.user_id === userId)
  if (userEntry && userEntry.profile) {
    userEntry.profile.role = newRole
    userEntry.profile.updated_at = new Date().toISOString()
    return userEntry.profile
  }
  return null
}

// Mock implementation for development
const createMockClient = (): MockSupabaseClient => {
  return {
    auth: {
      signUp: async (options) => {
        console.log("[v0] Mock signUp called with:", options)

        // Generate new user ID
        const newUserId = `user-${Date.now()}`
        const newUser = {
          id: newUserId,
          email: options.email,
          user_metadata: { full_name: `${options.email}`, role: "volunteer" },
        }

        // Store user in mock database
        mockUsers[options.email] = {
          ...newUser,
          profile: null, // Will be created separately
        }

        return {
          data: {
            user: newUser,
            session: { access_token: `mock-token-${newUserId}`, user: newUser },
          },
          error: null,
        }
      },
      signInWithPassword: async (options) => {
        console.log("[v0] Mock signIn called with:", options.email)

        // Check if user exists in mock database
        const existingUser = mockUsers[options.email]
        if (existingUser) {
          return {
            data: {
              user: existingUser,
              session: { access_token: `mock-token-${existingUser.id}`, user: existingUser },
            },
            error: null,
          }
        }

        // Default mock user for testing
        const mockUser = {
          id: "mock-user-id",
          email: options.email,
          user_metadata: { full_name: "Mock User", role: "volunteer" },
        }

        return {
          data: { user: mockUser, session: { access_token: "mock-token", user: mockUser } },
          error: null,
        }
      },
      signOut: async () => {
        console.log("[v0] Mock signOut called")
        return { error: null }
      },
      getUser: async () => {
        return { data: { user: null }, error: null }
      },
      getSession: async () => {
        return { data: { session: null }, error: null }
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        console.log("[v0] Mock onAuthStateChange called")

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                console.log("[v0] Mock subscription unsubscribed")
              },
            },
          },
        }
      },
    },
    from: (table: string) => {
      console.log("[v0] Mock database query on table:", table)

      // Mock data for different tables
      const mockData: Record<string, any[]> = {
        user_profiles: Object.values(mockUsers)
          .map((user) => user.profile)
          .filter(Boolean),
        nest_boxes: [
          {
            id: "mock-1",
            box_id: "NB001",
            name: "Oak Grove Box #1",
            description: "Located in the community park near the oak grove.",
            box_type: "standard",
            latitude: 42.1237,
            longitude: -71.1786,
            location_name: "Sharon Community Garden",
            location_description: "Near the main entrance",
            status: "active",
            maintenance_status: "good",
            installation_date: "2024-01-01",
            target_species: ["Eastern Bluebird"],
            primary_species: "Eastern Bluebird",
            is_public: true,
            featured: false,
            sponsor_dedication: "In memory of John Smith",
            custom_fields: {},
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "mock-2",
            box_id: "NB002",
            name: "Borderland Trail Box",
            description: "Trail marker box for hikers.",
            box_type: "platform",
            latitude: 42.1156,
            longitude: -71.1789,
            location_name: "Borderland State Park",
            location_description: "Main trail entrance",
            status: "maintenance",
            maintenance_status: "needs-cleaning",
            installation_date: "2024-02-15",
            target_species: ["American Robin"],
            primary_species: "American Robin",
            is_public: true,
            featured: true,
            sponsor_dedication: "Community Sponsored",
            custom_fields: {},
            created_at: "2024-02-15T00:00:00Z",
            updated_at: "2024-02-15T00:00:00Z",
          },
        ],
        activity_logs: [
          {
            id: "1",
            nest_box_id: "1",
            volunteer_id: "mock-user-id",
            species_observed: "Eastern Bluebird",
            egg_count: 3,
            observation_date: new Date().toISOString(),
          },
        ],
        volunteer_assignments: [
          {
            id: "1",
            nest_box_id: "2",
            volunteer_id: "mock-user-id",
            assignment_type: "maintenance",
            status: "assigned",
            description: "Clean nest box and check for damage",
          },
        ],
      }

      const createQueryBuilder = (data: any[]) => {
        let filteredData = [...data]

        const queryBuilder = {
          select: (columns?: string) => {
            return {
              ...queryBuilder,
              eq: (column: string, value: any) => {
                filteredData = filteredData.filter((item: any) => item[column] === value)
                return {
                  ...queryBuilder,
                  order: (column: string, options?: { ascending?: boolean }) => {
                    filteredData.sort((a: any, b: any) => {
                      const aVal = a[column]
                      const bVal = b[column]
                      if (options?.ascending === false) {
                        return bVal > aVal ? 1 : -1
                      }
                      return aVal > bVal ? 1 : -1
                    })
                    return Promise.resolve({ data: filteredData, error: null })
                  },
                  then: (callback: any) => callback({ data: filteredData, error: null }),
                }
              },
              order: (column: string, options?: { ascending?: boolean }) => {
                filteredData.sort((a: any, b: any) => {
                  const aVal = a[column]
                  const bVal = b[column]
                  if (options?.ascending === false) {
                    return bVal > aVal ? 1 : -1
                  }
                  return aVal > bVal ? 1 : -1
                })
                return Promise.resolve({ data: filteredData, error: null })
              },
              then: (callback: any) => callback({ data: filteredData, error: null }),
            }
          },
          eq: (column: string, value: any) => {
            filteredData = filteredData.filter((item: any) => item[column] === value)
            return {
              ...queryBuilder,
              single: () => Promise.resolve({ data: filteredData[0] || null, error: null }),
              then: (callback: any) => callback({ data: filteredData, error: null }),
            }
          },
          single: () => Promise.resolve({ data: filteredData[0] || null, error: null }),
          then: (callback: any) => callback({ data: filteredData, error: null }),
        }

        return queryBuilder
      }

      return {
        select: (columns?: string) => createQueryBuilder(mockData[table] || []).select(columns),
        insert: (data: any) => {
          if (table === "user_profiles") {
            const newProfile = {
              id: `profile-${Date.now()}`,
              ...data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }

            // Find user by user_id and add profile
            const userEntry = Object.values(mockUsers).find((user: any) => user.id === data.user_id)
            if (userEntry) {
              userEntry.profile = newProfile
            }

            return {
              select: () => ({
                single: () => Promise.resolve({ data: newProfile, error: null }),
              }),
              then: (callback: any) => callback({ data: newProfile, error: null }),
            }
          }

          return {
            select: () => ({
              single: () => Promise.resolve({ data: { id: "new-id", ...data }, error: null }),
            }),
            then: (callback: any) => callback({ data: { id: "new-id", ...data }, error: null }),
          }
        },
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            then: (callback: any) => {
              if (table === "user_profiles" && column === "id" && data.role) {
                const updatedProfile = updateUserRole(value, data.role)
                if (updatedProfile) {
                  return callback({ data: updatedProfile, error: null })
                }
              }
              return callback({ data: { ...data }, error: null })
            },
          }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({
            then: (callback: any) => callback({ data: null, error: null }),
          }),
        }),
        eq: (column: string, value: any) => createQueryBuilder(mockData[table] || []).eq(column, value),
        single: () => Promise.resolve({ data: mockData[table]?.[0] || null, error: null }),
        order: (column: string, options?: { ascending?: boolean }) =>
          createQueryBuilder(mockData[table] || []).order(column, options),
      }
    },
  }
}

export function createClient() {
  return createMockClient() as any
}
