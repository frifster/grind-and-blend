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

// DELETE /api/admin/user-roles/[id] - Remove a role assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.USERS_UPDATE)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if assignment exists and get details
    const { data: assignment, error: fetchError } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(name),
        user:profiles(email)
      `)
      .eq('id', params.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Role assignment not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch role assignment' }, { status: 500 })
    }

    // Prevent removal of super_admin role from the last super admin
    if (assignment.role?.name === 'super_admin') {
      const { data: superAdminCount, error: countError } = await supabase
        .from('user_roles')
        .select('id', { count: 'exact' })
        .eq('role_id', assignment.role_id)

      if (countError) {
        console.error('Error counting super admins:', countError)
        return NextResponse.json({ error: 'Failed to verify super admin count' }, { status: 500 })
      }

      if ((superAdminCount as any)?.length <= 1) {
        return NextResponse.json({ 
          error: 'Cannot remove the last super admin role' 
        }, { status: 400 })
      }
    }

    // Remove role assignment
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error removing role assignment:', error)
      return NextResponse.json({ error: 'Failed to remove role assignment' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Role assignment removed successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/admin/user-roles/[id] - Get a specific role assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.USERS_READ)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch role assignment
    const { data: assignment, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(*),
        user:profiles(*),
        assigned_by_user:profiles!user_roles_assigned_by_fkey(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching role assignment:', error)
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Role assignment not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch role assignment' }, { status: 500 })
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}