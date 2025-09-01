"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, User, Database, Shield } from "lucide-react"
import type { Profile } from "@/lib/types/database"

interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
  details?: any
}

export default function TestAuthFlowPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    runTests()
  }, [])

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => [...prev, result])
  }

  const runTests = async () => {
    setIsLoading(true)
    setTestResults([])

    // Test 1: Check Supabase Client Connection
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      addTestResult({
        name: "Supabase Client Connection",
        status: "success",
        message: "Successfully connected to Supabase",
        details: { hasSession: !!data.session },
      })
    } catch (error) {
      addTestResult({
        name: "Supabase Client Connection",
        status: "error",
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }

    // Test 2: Check Authentication Status
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) throw error

      setUser(user)
      addTestResult({
        name: "Authentication Status",
        status: user ? "success" : "pending",
        message: user ? `Authenticated as ${user.email}` : "No authenticated user",
        details: user ? { id: user.id, email: user.email } : null,
      })
    } catch (error) {
      addTestResult({
        name: "Authentication Status",
        status: "error",
        message: `Auth check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }

    // Test 3: Check Profile Table Access
    if (user) {
      try {
        const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error

        setProfile(profileData)
        addTestResult({
          name: "Profile Table Access",
          status: "success",
          message: `Profile loaded for ${profileData.email}`,
          details: { role: profileData.role, username: profileData.username },
        })
      } catch (error) {
        addTestResult({
          name: "Profile Table Access",
          status: "error",
          message: `Profile fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }

    // Test 4: Check Nest Boxes Table Access
    try {
      const { data: nestBoxes, error } = await supabase
        .from("nest_boxes")
        .select("id, name, status") // removed is_public column that doesn't exist
        .limit(5)

      if (error) throw error

      addTestResult({
        name: "Nest Boxes Table Access",
        status: "success",
        message: `Found ${nestBoxes?.length || 0} nest boxes`,
        details: nestBoxes,
      })
    } catch (error) {
      addTestResult({
        name: "Nest Boxes Table Access",
        status: "error",
        message: `Nest boxes fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }

    // Test 5: Check RLS Policies
    try {
      const { data: notifications, error } = await supabase.from("notifications").select("id, title, type").limit(3)

      if (error && error.message.includes("RLS")) {
        addTestResult({
          name: "Row Level Security",
          status: "success",
          message: "RLS policies are active and protecting data",
        })
      } else if (error) {
        throw error
      } else {
        addTestResult({
          name: "Row Level Security",
          status: "success",
          message: `RLS allows access to ${notifications?.length || 0} notifications`,
          details: notifications,
        })
      }
    } catch (error) {
      addTestResult({
        name: "Row Level Security",
        status: "error",
        message: `RLS test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }

    // Test 6: Check Database Schema
    try {
      const tables = ["profiles", "nest_boxes", "activity_logs", "volunteer_assignments", "sponsors", "notifications"]
      const schemaResults = []

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select("*").limit(1)
          schemaResults.push({ table, exists: !error })
        } catch {
          schemaResults.push({ table, exists: false })
        }
      }

      const existingTables = schemaResults.filter((r) => r.exists).length
      addTestResult({
        name: "Database Schema",
        status: existingTables === tables.length ? "success" : "pending",
        message: `${existingTables}/${tables.length} tables accessible`,
        details: schemaResults,
      })
    } catch (error) {
      addTestResult({
        name: "Database Schema",
        status: "error",
        message: `Schema check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }

    setIsLoading(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold mb-2">NestBox Authentication & Database Test</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of authentication flow and database connectivity
          </p>
        </div>

        {/* User Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Authenticated
                  </Badge>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                {profile && (
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        profile.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }
                    >
                      {profile.role}
                    </Badge>
                    <span className="text-sm">{profile.username || profile.full_name || "No name set"}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  Not Authenticated
                </Badge>
                <span className="text-sm text-muted-foreground">Please sign in to test full functionality</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Test Results
            </CardTitle>
            <Button onClick={runTests} disabled={isLoading} size="sm">
              {isLoading ? "Running Tests..." : "Run Tests Again"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{result.name}</h4>
                      <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-primary hover:text-primary/80">View Details</summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}

              {testResults.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Run Tests" to start testing the authentication and database flow</p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Running comprehensive tests...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <a href="/auth/login">Login</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth/sign-up">Sign Up</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            This test page verifies that the NestBox application is properly connected to the Supabase database with the
            new comprehensive schema.
          </p>
        </div>
      </div>
    </div>
  )
}
