interface SupabaseClient {
  auth: {
    signUp: (options: { email: string; password: string }) => Promise<{ data: any; error: any }>
    signInWithPassword: (options: { email: string; password: string }) => Promise<{ data: any; error: any }>
    signOut: () => Promise<{ error: any }>
    getUser: () => Promise<{ data: { user: any }; error: any }>
    getSession: () => Promise<{ data: { session: any }; error: any }>
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      data: { subscription: { unsubscribe: () => void } }
    }
  }
  from: (table: string) => any
}

class CustomSupabaseClient implements SupabaseClient {
  private baseUrl: string
  private apiKey: string
  private session: any = null

  constructor(url: string, key: string) {
    this.baseUrl = url
    this.apiKey = key
  }

  auth = {
    signUp: async (options: { email: string; password: string }) => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/v1/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
          body: JSON.stringify(options),
        })

        const data = await response.json()

        if (response.ok) {
          // Create profile in database
          if (data.user) {
            await this.from("profiles").insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.email.split("@")[0],
              role: "volunteer",
            })
          }

          return { data, error: null }
        } else {
          return { data: null, error: data }
        }
      } catch (error) {
        return { data: null, error: { message: "Network error during signup" } }
      }
    },

    signInWithPassword: async (options: { email: string; password: string }) => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
          body: JSON.stringify(options),
        })

        const data = await response.json()

        if (response.ok) {
          this.session = data
          return { data, error: null }
        } else {
          return { data: null, error: data }
        }
      } catch (error) {
        return { data: null, error: { message: "Network error during sign in" } }
      }
    },

    signOut: async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/v1/logout`, {
          method: "POST",
          headers: {
            apikey: this.apiKey,
            Authorization: `Bearer ${this.session?.access_token}`,
          },
        })

        this.session = null
        return { error: null }
      } catch (error) {
        return { error: { message: "Network error during sign out" } }
      }
    },

    getUser: async () => {
      if (!this.session?.access_token) {
        return { data: { user: null }, error: null }
      }

      try {
        const response = await fetch(`${this.baseUrl}/auth/v1/user`, {
          headers: {
            apikey: this.apiKey,
            Authorization: `Bearer ${this.session.access_token}`,
          },
        })

        const data = await response.json()
        return { data: { user: response.ok ? data : null }, error: response.ok ? null : data }
      } catch (error) {
        return { data: { user: null }, error: { message: "Network error getting user" } }
      }
    },

    getSession: async () => {
      return { data: { session: this.session }, error: null }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simulate auth state change
      setTimeout(() => callback("INITIAL_SESSION", this.session), 100)

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log("Auth state change unsubscribed")
            },
          },
        },
      }
    },
  }

  from = (table: string) => {
    const createQueryBuilder = () => {
      let query = ""
      const filters: string[] = []

      const builder = {
        select: (columns = "*") => {
          query = `select=${columns}`
          return {
            ...builder,
            eq: (column: string, value: any) => {
              filters.push(`${column}=eq.${value}`)
              return {
                ...builder,
                order: (column: string, options?: { ascending?: boolean }) => {
                  const direction = options?.ascending === false ? "desc" : "asc"
                  query += `&order=${column}.${direction}`
                  return this.executeQuery(table, query, filters)
                },
                then: (callback: any) => this.executeQuery(table, query, filters).then(callback),
              }
            },
            order: (column: string, options?: { ascending?: boolean }) => {
              const direction = options?.ascending === false ? "desc" : "asc"
              query += `&order=${column}.${direction}`
              return this.executeQuery(table, query, filters)
            },
            then: (callback: any) => this.executeQuery(table, query, filters).then(callback),
          }
        },
        insert: (data: any) => ({
          select: () => ({
            single: () => this.executeInsert(table, data),
          }),
          then: (callback: any) => this.executeInsert(table, data).then(callback),
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            then: (callback: any) => this.executeUpdate(table, data, column, value).then(callback),
          }),
        }),
      }

      return builder
    }

    return createQueryBuilder()
  }

  private async executeQuery(table: string, query: string, filters: string[]) {
    try {
      const filterQuery = filters.length > 0 ? `&${filters.join("&")}` : ""
      const url = `${this.baseUrl}/rest/v1/${table}?${query}${filterQuery}`

      const response = await fetch(url, {
        headers: {
          apikey: this.apiKey,
          Authorization: this.session?.access_token ? `Bearer ${this.session.access_token}` : "",
        },
      })

      const data = await response.json()
      return { data: response.ok ? data : [], error: response.ok ? null : data }
    } catch (error) {
      return { data: [], error: { message: "Network error during query" } }
    }
  }

  private async executeInsert(table: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}/rest/v1/${table}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
          Authorization: this.session?.access_token ? `Bearer ${this.session.access_token}` : "",
          Prefer: "return=representation",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      return { data: response.ok ? result : null, error: response.ok ? null : result }
    } catch (error) {
      return { data: null, error: { message: "Network error during insert" } }
    }
  }

  private async executeUpdate(table: string, data: any, column: string, value: any) {
    try {
      const response = await fetch(`${this.baseUrl}/rest/v1/${table}?${column}=eq.${value}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
          Authorization: this.session?.access_token ? `Bearer ${this.session.access_token}` : "",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      return { data: response.ok ? result : null, error: response.ok ? null : result }
    } catch (error) {
      return { data: null, error: { message: "Network error during update" } }
    }
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_NESTBOXSUPABASE_URL
  const key = process.env.NEXT_PUBLIC_NESTBOXSUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("Missing Supabase environment variables")
    return null
  }

  return new CustomSupabaseClient(url, key)
}
