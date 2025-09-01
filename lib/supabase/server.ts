import { cookies } from "next/headers"

// Custom server client that mimics Supabase server functionality
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_NESTBOXSUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_NESTBOXSUPABASE_ANON_KEY!

  // Get session from cookies
  const getSession = async () => {
    const sessionCookie = cookieStore.get("sb-access-token")
    if (!sessionCookie) return { data: { session: null }, error: null }

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${sessionCookie.value}`,
          apikey: supabaseKey,
        },
      })

      if (response.ok) {
        const user = await response.json()
        return {
          data: {
            session: {
              user,
              access_token: sessionCookie.value,
            },
          },
          error: null,
        }
      }
    } catch (error) {
      console.error("Session validation error:", error)
    }

    return { data: { session: null }, error: null }
  }

  // Database query builder
  const from = (table: string) => ({
    select: (columns = "*") => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          try {
            const session = await getSession()
            const token = session.data.session?.access_token || supabaseKey

            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                apikey: supabaseKey,
                "Content-Type": "application/json",
              },
            })

            if (response.ok) {
              const data = await response.json()
              return { data: data[0] || null, error: null }
            }

            return { data: null, error: { message: "Query failed" } }
          } catch (error) {
            return { data: null, error }
          }
        },
      }),
    }),
    insert: (values: any) => ({
      select: () => ({
        single: async () => {
          try {
            const session = await getSession()
            const token = session.data.session?.access_token || supabaseKey

            const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                apikey: supabaseKey,
                "Content-Type": "application/json",
                Prefer: "return=representation",
              },
              body: JSON.stringify(values),
            })

            if (response.ok) {
              const data = await response.json()
              return { data: data[0] || null, error: null }
            }

            return { data: null, error: { message: "Insert failed" } }
          } catch (error) {
            return { data: null, error }
          }
        },
      }),
    }),
  })

  return {
    auth: {
      getSession,
      getUser: async () => {
        const session = await getSession()
        return {
          data: { user: session.data.session?.user || null },
          error: null,
        }
      },
    },
    from,
  }
}
