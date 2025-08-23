import { useState, useEffect } from 'react'
import { supabase, Role, UserRole, RoleWithPermissions, Database } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface UseRolesReturn {
  roles: Role[]
  userRoles: UserRole[]
  rolesWithPermissions: RoleWithPermissions[]
  loading: boolean
  error: string | null
  assignRole: (userId: string, roleId: string, expiresAt?: string) => Promise<boolean>
  removeRole: (userId: string, roleId: string) => Promise<boolean>
  createRole: (name: string, description?: string) => Promise<Role | null>
  updateRole: (roleId: string, updates: { name?: string; description?: string }) => Promise<boolean>
  deleteRole: (roleId: string) => Promise<boolean>
  getUserRoles: (userId: string) => Promise<UserRole[]>
  refreshRoles: () => Promise<void>
}

export function useRoles(): UseRolesReturn {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [rolesWithPermissions, setRolesWithPermissions] = useState<RoleWithPermissions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name')

      if (rolesError) throw rolesError

      // Fetch roles with permissions
      const { data: rolesWithPermsData, error: rolesWithPermsError } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            *,
            permissions (*)
          )
        `)
        .order('name')

      if (rolesWithPermsError) throw rolesWithPermsError

      setRoles(rolesData || [])
      setRolesWithPermissions(rolesWithPermsData || [])

      // Fetch current user's roles if authenticated
      if (user) {
        const { data: userRolesData, error: userRolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .or('expires_at.is.null,expires_at.gt.now()')

        if (userRolesError) throw userRolesError
        setUserRoles(userRolesData || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  const assignRole = async (userId: string, roleId: string, expiresAt?: string): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await fetch('/api/admin/user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          roleId,
          expiresAt
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      await fetchRoles() // Refresh data
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role')
      return false
    }
  }

  const removeRole = async (userId: string, roleId: string): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await fetch(`/api/admin/user-roles/${userId}?roleId=${roleId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      await fetchRoles() // Refresh data
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove role')
      return false
    }
  }

  const createRole = async (name: string, description?: string): Promise<Role | null> => {
    try {
      setError(null)
      
      const { data, error } = await (supabase as any)
        .from('roles')
        .insert({
          name,
          description: description || null
        })
        .select()
        .single()

      if (error) throw error

      await fetchRoles() // Refresh data
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role'
      setError(errorMessage)
      return null
    }
  }

  const updateRole = async (roleId: string, updates: { name?: string; description?: string }): Promise<boolean> => {
    try {
      setError(null)
      
      const { error } = await (supabase as any)
        .from('roles')
        .update({
          name: updates.name,
          description: updates.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId)

      if (error) throw error

      await fetchRoles() // Refresh data
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      return false
    }
  }

  const deleteRole = async (roleId: string): Promise<boolean> => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId)

      if (error) throw error

      await fetchRoles() // Refresh data
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role')
      return false
    }
  }

  const getUserRoles = async (userId: string): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .or('expires_at.is.null,expires_at.gt.now()')

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user roles')
      return []
    }
  }

  const refreshRoles = async (): Promise<void> => {
    await fetchRoles()
  }

  useEffect(() => {
    fetchRoles()
  }, [user])

  return {
    roles,
    userRoles,
    rolesWithPermissions,
    loading,
    error,
    assignRole,
    removeRole,
    createRole,
    updateRole,
    deleteRole,
    getUserRoles,
    refreshRoles
  }
}