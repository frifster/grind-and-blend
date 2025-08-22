import { supabase } from './supabase'

// Permission checking utilities
export class PermissionChecker {
  private static instance: PermissionChecker
  private userPermissions: Set<string> = new Set()
  private loading = false

  private constructor() {}

  static getInstance(): PermissionChecker {
    if (!PermissionChecker.instance) {
      PermissionChecker.instance = new PermissionChecker()
    }
    return PermissionChecker.instance
  }

  async loadUserPermissions(userId: string): Promise<void> {
    if (this.loading) return
    
    try {
      this.loading = true
      this.userPermissions.clear()

      const { data: userWithRoles, error } = await (supabase as any)
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
        .eq('id', userId)
        .or('user_roles.expires_at.is.null,user_roles.expires_at.gt.now()')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Extract permissions
      if (userWithRoles?.user_roles) {
        userWithRoles.user_roles.forEach((userRole: any) => {
          if (userRole.roles?.role_permissions) {
            userRole.roles.role_permissions.forEach((rolePermission: any) => {
              if (rolePermission.permissions?.name) {
                this.userPermissions.add(rolePermission.permissions.name)
              }
            })
          }
        })
      }
    } catch (error) {
      console.error('Failed to load user permissions:', error)
    } finally {
      this.loading = false
    }
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions.has(permission)
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.userPermissions.has(permission))
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.userPermissions.has(permission))
  }

  canAccess(resource: string, action: string): boolean {
    const permissionName = `${resource}.${action}`
    return this.hasPermission(permissionName)
  }

  clearPermissions(): void {
    this.userPermissions.clear()
  }

  getPermissions(): string[] {
    return Array.from(this.userPermissions)
  }
}

// Singleton instance
export const permissionChecker = PermissionChecker.getInstance()

// Utility functions
export const checkPermission = (permission: string): boolean => {
  return permissionChecker.hasPermission(permission)
}

export const checkAnyPermission = (permissions: string[]): boolean => {
  return permissionChecker.hasAnyPermission(permissions)
}

export const checkAllPermissions = (permissions: string[]): boolean => {
  return permissionChecker.hasAllPermissions(permissions)
}

export const canAccessResource = (resource: string, action: string): boolean => {
  return permissionChecker.canAccess(resource, action)
}

// Role-based access control constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer'
} as const

export const PERMISSIONS = {
  // User management
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  
  // Role management
  ROLES_CREATE: 'roles.create',
  ROLES_READ: 'roles.read',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_ASSIGN: 'roles.assign',
  
  // Permission management
  PERMISSIONS_CREATE: 'permissions.create',
  PERMISSIONS_READ: 'permissions.read',
  PERMISSIONS_UPDATE: 'permissions.update',
  PERMISSIONS_DELETE: 'permissions.delete',
  
  // Product management
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_READ: 'products.read',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  
  // Order management
  ORDERS_CREATE: 'orders.create',
  ORDERS_READ: 'orders.read',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_DELETE: 'orders.delete',
  ORDERS_MANAGE: 'orders.manage',
  
  // Analytics
  ANALYTICS_READ: 'analytics.read',
  
  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update'
} as const

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE
  ],
  ROLE_MANAGEMENT: [
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.ROLES_DELETE,
    PERMISSIONS.ROLES_ASSIGN
  ],
  PRODUCT_MANAGEMENT: [
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE
  ],
  ORDER_MANAGEMENT: [
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_DELETE,
    PERMISSIONS.ORDERS_MANAGE
  ],
  ADMIN_ACCESS: [
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE
  ]
} as const

// Helper function to check if user has admin privileges
export const isAdmin = (): boolean => {
  return checkAnyPermission([
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.ROLES_ASSIGN,
    PERMISSIONS.SETTINGS_UPDATE
  ])
}

// Helper function to check if user has manager privileges
export const isManager = (): boolean => {
  return checkAnyPermission([
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.PRODUCTS_UPDATE
  ])
}

// Helper function to check if user can manage users
export const canManageUsers = (): boolean => {
  return checkAnyPermission([...PERMISSION_GROUPS.USER_MANAGEMENT])
}

// Helper function to check if user can manage products
export const canManageProducts = (): boolean => {
  return checkAnyPermission([...PERMISSION_GROUPS.PRODUCT_MANAGEMENT])
}

// Helper function to check if user can manage orders
export const canManageOrders = (): boolean => {
  return checkAnyPermission([...PERMISSION_GROUPS.ORDER_MANAGEMENT])
}