import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase'

// GET /api/user/permissions - Get current user's permissions
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user - handle missing session gracefully
    let user = null
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (!authError) {
        user = authUser
      }
    } catch (error) {
      // Session missing or invalid - continue without user
      console.log('Auth session missing, returning empty permissions')
    }
    
    if (!user) {
      console.log('No user found, returning empty permissions')
       return NextResponse.json({ 
         permissions: [], 
         userPermissions: [] 
       })
     }

     console.log('User:', user)

    // Fetch all permissions
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('permissions')
      .select('*')
      .order('resource, action')

    console.log('Permissions:', permissionsData)

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError)
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
    }

    // Fetch user's roles first (simpler query to avoid RLS recursion)
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id)
      .or('expires_at.is.null,expires_at.gt.now()')
    
    if (userRolesError) {
      console.error('Error fetching user roles:', userRolesError)
      return NextResponse.json({ error: 'Failed to fetch user roles' }, { status: 500 })
    }

    // If no roles, return empty permissions
    if (!userRoles || userRoles.length === 0) {
      return NextResponse.json({
        permissions: permissionsData || [],
        userPermissions: []
      })
    }

    // Fetch role permissions for user's roles
    const roleIds = userRoles.map(ur => ur.role_id)
    const { data: rolePermissions, error: rolePermError } = await supabase
      .from('role_permissions')
      .select(`
        permissions!inner (name)
      `)
      .in('role_id', roleIds)
    
    const userWithRoles = { user_roles: userRoles }
    const userError = rolePermError

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user roles:', userError)
      return NextResponse.json({ error: 'Failed to fetch user permissions' }, { status: 500 })
    }

    // Extract unique permission names from the simpler query
    const permissionNames = new Set<string>()
    
    if (rolePermissions) {
      rolePermissions.forEach((rolePermission: any) => {
        if (rolePermission.permissions?.name) {
          permissionNames.add(rolePermission.permissions.name)
        }
      })
    }

    console.log('Permissions:', Array.from(permissionNames))

    return NextResponse.json({
      permissions: permissionsData || [],
      userPermissions: Array.from(permissionNames)
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}