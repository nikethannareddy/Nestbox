"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, User, Shield, Mail, Lock } from "lucide-react"

export default function AuthTestPage() {
  const { user, isAuthenticated, login, signup, logout } = useAuth()
  const [testResults, setTestResults] = useState<
    Array<{ test: string; status: "pass" | "fail" | "pending"; message: string }>
  >([])
  const [testData, setTestData] = useState({
    email: "test@example.com",
    password: "password123",
    firstName: "Test",
    lastName: "User",
  })

  const addTestResult = (test: string, status: "pass" | "fail" | "pending", message: string) => {
    setTestResults((prev) => [...prev, { test, status, message }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const testSignup = async () => {
    addTestResult("Signup Test", "pending", "Testing user signup...")

    try {
      const result = await signup(testData.email, testData.password, {
        firstName: testData.firstName,
        lastName: testData.lastName,
        role: "volunteer",
      })

      if (result.error) {
        addTestResult("Signup Test", "fail", `Signup failed: ${result.error}`)
      } else {
        addTestResult("Signup Test", "pass", "User signup successful - new volunteer created")
      }
    } catch (error) {
      addTestResult("Signup Test", "fail", `Signup error: ${error}`)
    }
  }

  const testLogin = async () => {
    addTestResult("Login Test", "pending", "Testing user login...")

    try {
      const result = await login(testData.email, testData.password)

      if (result.error) {
        addTestResult("Login Test", "fail", `Login failed: ${result.error}`)
      } else {
        addTestResult("Login Test", "pass", "User login successful")
      }
    } catch (error) {
      addTestResult("Login Test", "fail", `Login error: ${error}`)
    }
  }

  const testAdminLogin = async () => {
    addTestResult("Admin Login Test", "pending", "Testing admin login...")

    try {
      const result = await login("admin@nestbox.app", "admin123")

      if (result.error) {
        addTestResult("Admin Login Test", "fail", `Admin login failed: ${result.error}`)
      } else {
        addTestResult("Admin Login Test", "pass", "Admin login successful")
      }
    } catch (error) {
      addTestResult("Admin Login Test", "fail", `Admin login error: ${error}`)
    }
  }

  const testLogout = async () => {
    addTestResult("Logout Test", "pending", "Testing user logout...")

    try {
      await logout()
      addTestResult("Logout Test", "pass", "User logout successful")
    } catch (error) {
      addTestResult("Logout Test", "fail", `Logout error: ${error}`)
    }
  }

  const runAllTests = async () => {
    clearResults()

    // Test 1: Signup
    await testSignup()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test 2: Login
    await testLogin()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test 3: Logout
    await testLogout()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test 4: Admin Login
    await testAdminLogin()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test 5: Final Logout
    await testLogout()

    addTestResult("All Tests", "pass", "Authentication flow testing completed")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Authentication Flow Test</h1>
          <p className="text-emerald-700">
            Test the complete authentication system including signup, login, and role management
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current User Status */}
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Current User Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Authenticated:</span>
                {isAuthenticated ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    No
                  </Badge>
                )}
              </div>

              {user && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Name:</span>
                    <span>
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Role:</span>
                    <Badge
                      className={user.role === "admin" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}
                    >
                      {user.role === "admin" ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900">Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Test Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={testData.email}
                    onChange={(e) => setTestData((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Test Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={testData.password}
                    onChange={(e) => setTestData((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="First Name"
                  value={testData.firstName}
                  onChange={(e) => setTestData((prev) => ({ ...prev, firstName: e.target.value }))}
                />
                <Input
                  placeholder="Last Name"
                  value={testData.lastName}
                  onChange={(e) => setTestData((prev) => ({ ...prev, lastName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Button onClick={runAllTests} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Run All Tests
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={testSignup} variant="outline" size="sm">
                    Test Signup
                  </Button>
                  <Button onClick={testLogin} variant="outline" size="sm">
                    Test Login
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={testAdminLogin} variant="outline" size="sm">
                    Test Admin
                  </Button>
                  <Button onClick={testLogout} variant="outline" size="sm">
                    Test Logout
                  </Button>
                </div>
                <Button onClick={clearResults} variant="outline" size="sm" className="w-full bg-transparent">
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mt-6 bg-white/80 backdrop-blur-sm border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-emerald-200">
                    <div className="flex-shrink-0 mt-0.5">
                      {result.status === "pass" && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {result.status === "fail" && <XCircle className="h-5 w-5 text-red-600" />}
                      {result.status === "pending" && (
                        <div className="h-5 w-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-emerald-900">{result.test}</span>
                        <Badge
                          className={
                            result.status === "pass"
                              ? "bg-green-100 text-green-800"
                              : result.status === "fail"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-emerald-700">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Test */}
        <Card className="mt-6 bg-white/80 backdrop-blur-sm border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">Navigation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-emerald-700">Test the conditional admin link by logging in as different user types:</p>
              <div className="grid gap-2 md:grid-cols-3">
                <Button asChild variant="outline">
                  <a href="/">Home (Check Navigation)</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/dashboard">Volunteer Dashboard</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/admin">Admin Dashboard</a>
                </Button>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-medium text-emerald-900 mb-2">Expected Behavior:</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Regular users: See user name link, no admin link</li>
                  <li>• Admin users: See user name link AND red admin link</li>
                  <li>• Not logged in: See "Sign In" button only</li>
                  <li>• Admin credentials: admin@nestbox.app / admin123</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
