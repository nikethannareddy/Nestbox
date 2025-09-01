interface SupabaseAuthResponse {
  data: {
    user: any
    session: any
  } | null
  error: any
}

interface SupabaseQueryResponse {
  data: any
  error: any
}

class SupabaseClient {
  private url: string
  private anonKey: string
  private authListeners: ((event: string, session: any) => void)[] = []

  constructor(url: string, anonKey: string) {
    this.url = url
    this.anonKey = anonKey
  }

  get auth() {
    return {
      signUp: async ({
        email,
        password,
        options,
      }: { email: string; password: string; options?: any }): Promise<SupabaseAuthResponse> => {
        try {
          const response = await fetch(`${this.url}/auth/v1/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: this.anonKey,
            },
            body: JSON.stringify({ email, password, ...options }),
          })

          const result = await response.json()

          if (response.ok) {
            // Trigger auth state change
            this.authListeners.forEach((listener) => listener("SIGNED_UP", result.session))
            return { data: result, error: null }
          } else {
            return { data: null, error: result }
          }
        } catch (error) {
          return { data: null, error }
        }
      },

      signInWithPassword: async ({
        email,
        password,
      }: { email: string; password: string }): Promise<SupabaseAuthResponse> => {
        try {
          const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: this.anonKey,
            },
            body: JSON.stringify({ email, password }),
          })

          const result = await response.json()

          if (response.ok) {
            // Store session in localStorage
            if (typeof window !== "undefined") {
              localStorage.setItem("supabase.auth.token", JSON.stringify(result))
            }
            // Trigger auth state change
            this.authListeners.forEach((listener) => listener("SIGNED_IN", result))
            return { data: result, error: null }
          } else {
            return { data: null, error: result }
          }
        } catch (error) {
          return { data: null, error }
        }
      },

      signOut: async (): Promise<{ error: any }> => {
        try {
          // Clear localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("supabase.auth.token")
          }
          // Trigger auth state change
          this.authListeners.forEach((listener) => listener("SIGNED_OUT", null))
          return { error: null }
        } catch (error) {
          return { error }
        }
      },

      getSession: async () => {
        try {
          if (typeof window !== "undefined") {
            const stored = localStorage.getItem("supabase.auth.token")
            if (stored) {
              const session = JSON.parse(stored)
              return { data: { session }, error: null }
            }
          }
          return { data: { session: null }, error: null }
        } catch (error) {
          return { data: { session: null }, error }
        }
      },

      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        this.authListeners.push(callback)

        // Check for existing session on mount
        setTimeout(async () => {
          const { data } = await this.auth.getSession()
          if (data.session) {
            callback("SIGNED_IN", data.session)
          }
        }, 0)

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const index = this.authListeners.indexOf(callback)
                if (index > -1) {
                  this.authListeners.splice(index, 1)
                }
              },
            },
          },
        }
      },
    }
  }

  from(table: string) {
    return new QueryBuilder(this.url, this.anonKey, table)
  }
}

class QueryBuilder {
  private url: string
  private anonKey: string
  private table: string
  private selectFields = "*"
  private filters: string[] = []
  private orderBy = ""

  constructor(url: string, anonKey: string, table: string) {
    this.url = url
    this.anonKey = anonKey
    this.table = table
  }

  select(fields = "*") {
    this.selectFields = fields
    return this
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`)
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? "desc" : "asc"
    this.orderBy = `&order=${column}.${direction}`
    return this
  }

  async single(): Promise<SupabaseQueryResponse> {
    const filterString = this.filters.length > 0 ? `&${this.filters.join("&")}` : ""
    const url = `${this.url}/rest/v1/${this.table}?select=${this.selectFields}${filterString}${this.orderBy}&limit=1`

    try {
      const response = await fetch(url, {
        headers: {
          apikey: this.anonKey,
          Authorization: `Bearer ${this.anonKey}`,
        },
      })

      const result = await response.json()

      if (response.ok) {
        return { data: result[0] || null, error: null }
      } else {
        return { data: null, error: result }
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  async insert(data: any): Promise<SupabaseQueryResponse> {
    try {
      const response = await fetch(`${this.url}/rest/v1/${this.table}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.anonKey,
          Authorization: `Bearer ${this.anonKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        return { data: result, error: null }
      } else {
        return { data: null, error: result }
      }
    } catch (error) {
      return { data: null, error }
    }
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_NESTBOXSUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_NESTBOXSUPABASE_ANON_KEY

  console.log("[v0] Supabase URL:", url ? "✓ Found" : "✗ Missing")
  console.log("[v0] Supabase Anon Key:", anonKey ? "✓ Found" : "✗ Missing")

  if (!url || !anonKey) {
    console.error("[v0] Missing Supabase environment variables:", { url: !!url, anonKey: !!anonKey })
    throw new Error("Supabase URL and anon key are required")
  }

  console.log("[v0] Creating custom Supabase client")
  return new SupabaseClient(url, anonKey)
}
