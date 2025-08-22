import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase'
import { PERMISSIONS } from '@/lib/permissions'

// Helper function to check user permissions
async function checkPermission(supabase: any, userId: string, permission: string) {
  const { data: userPermissions, error } = await supabase
    .from('user_roles')
    .select(`
      role:roles(
        role_permissions(
          permission:permissions(name)
        )
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error checking permissions:', error)
    return false
  }

  const permissions = userPermissions?.flatMap((ur: any) => 
    ur.role?.role_permissions?.map((rp: any) => rp.permission?.name) || []
  ) || []

  return permissions.includes(permission)
}

// GET /api/admin/role-permissions - Get role-permission assignments
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.ROLES_READ)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get URL parameters
    const url = new URL(request.url)
    const roleId = url.searchParams.get('roleId')

    let query = supabase
      .from('role_permissions')
      .select(`
        *,
        role:roles(*),
        permission:permissions(*)
      `)
      .order('created_at', { ascending: false })

    // Filter by role if specified
    if (roleId) {
      query = query.eq('role_id', roleId)
    }

    const { data: rolePermissions, error } = await query

    if (error) {
      console.error('Error fetching role permissions:', error)
      return NextResponse.json({ error: 'Failed to fetch role permissions' }, { status: 500 })
    }

    return NextResponse.json({ rolePermissions })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/role-permissions - Assign a permission to a role
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.ROLES_UPDATE)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const { roleId, permissionId } = await request.json()
    if (!roleId || !permissionId) {
      return NextResponse.json({ error: 'Role ID and Permission ID are required' }, { status: 400 })
    }

    // Check if role exists
    const { data: roleExists, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('id', roleId)
      .single()

    if (roleError || !roleExists) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Check if permission exists
    const { data: permissionExists, error: permissionError } = await supabase
      .from('permissions')
      .select('id')
      .eq('id', permissionId)
      .single()

    if (permissionError || !permissionExists) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
    }

    // Check if assignment already exists
    const { data: existingAssignment, error: checkError } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('role_id', roleId)
      .eq('permission_id', permissionId)
      .single()

    if (existingAssignment) {
      return NextResponse.json({ error: 'Permission already assigned to this role' }, { status: 409 })
    }

    // Assign permission to role
    const { data: assignment, error } = await supabase
      .from('role_permissions')
      .insert({
        role_id: roleId,
        permission_id: permissionId
      })
      .select(`
        *,
        role:roles(*),
        permission:permissions(*)
      `)
      .single()

    if (error) {
      console.error('Error assigning permission:', error)
      return NextResponse.json({ error: 'Failed to assign permission' }, { status: 500 })
    }

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/role-permissions - Remove a permission from a role
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.ROLES_UPDATE)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const { roleId, permissionId } = await request.json()
    if (!roleId || !permissionId) {
      return NextResponse.json({ error: 'Role ID and Permission ID are required' }, { status: 400 })
    }

    // Check if assignment exists
    const { data: assignment, error: fetchError } = await supabase
      .from('role_permissions')
      .select(`
        *,
        role:roles(name),
        permission:permissions(name)
      `)
      .eq('role_id', roleId)
      .eq('permission_id', permissionId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Permission assignment not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch permission assignment' }, { status: 500 })
    }

    // Prevent removal of critical permissions from super_admin role
    if (assignment.role?.name === 'super_admin') {
      const criticalPermissions = [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'roles.create', 'roles.read', 'roles.update', 'roles.delete', 'roles.assign',
        'permissions.create', 'permissions.read', 'permissions.update', 'permissions.delete'
      ]
      
      if (criticalPermissions.includes(assignment.permission?.name)) {
        return NextResponse.json({ 
          error: 'Cannot remove critical permissions from super_admin role' 
        }, { status: 400 })
      }
    }

    // Remove permission assignment
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId)

    if (error) {
      console.error('Error removing permission assignment:', error)
      return NextResponse.json({ error: 'Failed to remove permission assignment' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Permission assignment removed successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}