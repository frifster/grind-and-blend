import React, { useState, useEffect } from 'react'
import { supabase, Permission, UserWithRoles } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface UsePermissionsReturn {
  permissions: Permission[]
  userPermissions: string[]
  loading: boolean
  error: string | null
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  canAccess: (resource: string, action: string) => boolean
  refreshPermissions: () => Promise<void>
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .order('resource, action')

      if (permissionsError) throw permissionsError
      setPermissions(permissionsData || [])

      // Fetch user's permissions if authenticated
      if (user) {
        const { data: userWithRoles, error: userError } = await (supabase as any)
          .from('profiles')
          .select(`
            *,
            user_roles!inner (
              *,
              roles!inner (
                *,
                role_permissions (
                  *,
                  permissions (*)
                )
              )
            )
          `)
          .eq('id', user.id)
          .or('user_roles.expires_at.is.null,user_roles.expires_at.gt.now()')
          .single()

        if (userError && userError.code !== 'PGRST116') {
          throw userError
        }

        // Extract unique permission names
        const permissionNames = new Set<string>()
        
        if (userWithRoles?.user_roles) {
          userWithRoles.user_roles.forEach((userRole: any) => {
            if (userRole.roles?.role_permissions) {
              userRole.roles.role_permissions.forEach((rolePermission: any) => {
                if (rolePermission.permissions?.name) {
                  permissionNames.add(rolePermission.permissions.name)
                }
              })
            }
          })
        }

        setUserPermissions(Array.from(permissionNames))
      } else {
        setUserPermissions([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission))
  }

  const canAccess = (resource: string, action: string): boolean => {
    const permissionName = `${resource}.${action}`
    return hasPermission(permissionName)
  }

  const refreshPermissions = async (): Promise<void> => {
    await fetchPermissions()
  }

  useEffect(() => {
    fetchPermissions()
  }, [user])

  return {
    permissions,
    userPermissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    refreshPermissions
  }
}

// Higher-order component for permission-based rendering
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission: string | string[],
  fallback?: React.ComponentType<T> | React.ReactElement | null
) {
  return function PermissionWrapper(props: T) {
    const { hasPermission, hasAnyPermission, loading } = usePermissions()
    
    if (loading) {
      return React.createElement('div', null, 'Loading...')
    }
    
    const hasAccess = Array.isArray(requiredPermission)
      ? hasAnyPermission(requiredPermission)
      : hasPermission(requiredPermission)
    
    if (!hasAccess) {
      if (fallback) {
        if (React.isValidElement(fallback)) {
          return fallback
        }
        const FallbackComponent = fallback as React.ComponentType<T>
        return React.createElement(FallbackComponent, props)
      }
      return null
    }
    
    return React.createElement(Component, props)
  }
}

// Hook for conditional rendering based on permissions
export function usePermissionGuard() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canAccess, loading } = usePermissions()
  
  const PermissionGuard = ({ 
    permission, 
    permissions, 
    requireAll = false,
    resource,
    action,
    children, 
    fallback 
  }: {
    permission?: string
    permissions?: string[]
    requireAll?: boolean
    resource?: string
    action?: string
    children: React.ReactNode
    fallback?: React.ReactNode
  }) => {
    if (loading) {
      return React.createElement('div', null, 'Loading...')
    }
    
    let hasAccess = false
    
    if (resource && action) {
      hasAccess = canAccess(resource, action)
    } else if (permission) {
      hasAccess = hasPermission(permission)
    } else if (permissions) {
      hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
    }
    
    return hasAccess ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback)
  }
  
  return { PermissionGuard, hasPermission, hasAnyPermission, hasAllPermissions, canAccess }
}