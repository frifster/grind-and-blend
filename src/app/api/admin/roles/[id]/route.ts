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

// GET /api/admin/roles/[id] - Get a specific role
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
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.ROLES_READ)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch role with permissions
    const { data: role, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(
          permission:permissions(*)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching role:', error)
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Role not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 })
    }

    return NextResponse.json({ role })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/roles/[id] - Update a role
export async function PUT(
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
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.ROLES_UPDATE)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const { name, description } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    // Update role
    const { data: role, error } = await supabase
      .from('roles')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating role:', error)
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Role not found' }, { status: 404 })
      }
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Role name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    return NextResponse.json({ role })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/roles/[id] - Delete a role
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
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.ROLES_DELETE)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if role exists and get its name
    const { data: existingRole, error: fetchError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Role not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 })
    }

    // Prevent deletion of system roles
    if (existingRole.name === 'super_admin' || existingRole.name === 'admin') {
      return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 400 })
    }

    // Delete role (this will cascade to role_permissions and user_roles due to foreign key constraints)
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting role:', error)
      return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}