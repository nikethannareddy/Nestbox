"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'

type ProtectedRouteProps = {
  children: React.ReactNode
  requiredRole?: string | string[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.replace(redirectTo)
      return
    }

    // Check role if required
    if (requiredRole && !hasRole(requiredRole)) {
      // Redirect to a default route if user doesn't have required role
      const defaultRoute = user?.role === 'admin' ? '/admin' : '/dashboard'
      router.replace(defaultRoute)
    }
  }, [isAuthenticated, isLoading, hasRole, requiredRole, router, redirectTo, user])

  // Show loading state or nothing while checking auth
  if (isLoading || !isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
    return null // Or a loading spinner
  }

  return <>{children}</>
}

// Helper component for admin-only routes
export function AdminRoute({ children, redirectTo }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  )
}

// Helper component for volunteer-only routes
export function VolunteerRoute({ children, redirectTo }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="volunteer" redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  )
}
