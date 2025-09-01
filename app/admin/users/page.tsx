"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_admin: boolean
  is_superuser: boolean
  last_sign_in_at: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const { user, hasRole } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { data, error } = await supabase.rpc('is_admin')
        if (!error && data) {
          setIsAdmin(true)
          fetchUsers()
        } else {
          window.location.href = '/'
        }
      } else {
        window.location.href = '/auth'
      }
    }

    checkAdmin()
  }, [user])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_admin', { user_id: userId })
      if (error) throw error
      toast.success('User promoted to admin')
      fetchUsers()
    } catch (error) {
      console.error('Error promoting user:', error)
      toast.error('Failed to promote user')
    }
  }

  const handleDemoteAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('demote_admin', { user_id: userId })
      if (error) throw error
      toast.success('Admin privileges removed')
      fetchUsers()
    } catch (error) {
      console.error('Error demoting admin:', error)
      toast.error('Failed to demote admin')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userData) => (
                <TableRow key={userData.id}>
                  <TableCell className="font-medium">
                    {userData.full_name || 'N/A'}
                    {userData.is_superuser && (
                      <Badge variant="outline" className="ml-2">Superuser</Badge>
                    )}
                  </TableCell>
                  <TableCell>{userData.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {userData.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {userData.is_admin ? (
                      <Badge className="bg-green-500">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {userData.last_sign_in_at 
                      ? new Date(userData.last_sign_in_at).toLocaleDateString() 
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {userData.id !== user?.id && (
                      <>
                        {!userData.is_admin ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePromoteToAdmin(userData.id)}
                            disabled={!hasRole('superuser')}
                          >
                            Make Admin
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDemoteAdmin(userData.id)}
                            disabled={!hasRole('superuser')}
                          >
                            Remove Admin
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
