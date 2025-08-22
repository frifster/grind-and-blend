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

// GET /api/admin/permissions/[id] - Get a specific permission
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
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.PERMISSIONS_READ)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch permission
    const { data: permission, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching permission:', error)
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch permission' }, { status: 500 })
    }

    return NextResponse.json({ permission })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/permissions/[id] - Update a permission
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
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.PERMISSIONS_UPDATE)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const { name, description, category } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Permission name is required' }, { status: 400 })
    }

    // Validate permission name format (should be UPPERCASE_WITH_UNDERSCORES)
    const namePattern = /^[A-Z][A-Z0-9_]*$/
    if (!namePattern.test(name)) {
      return NextResponse.json({ 
        error: 'Permission name must be in UPPERCASE_WITH_UNDERSCORES format' 
      }, { status: 400 })
    }

    // Update permission
    const { data: permission, error } = await supabase
      .from('permissions')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || 'general',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating permission:', error)
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
      }
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Permission name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 })
    }

    return NextResponse.json({ permission })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/permissions/[id] - Delete a permission
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
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.PERMISSIONS_DELETE)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if permission exists and get its name
    const { data: existingPermission, error: fetchError } = await supabase
      .from('permissions')
      .select('name')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch permission' }, { status: 500 })
    }

    // Prevent deletion of core system permissions
    const systemPermissions = [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'roles.create', 'roles.read', 'roles.update', 'roles.delete', 'roles.assign',
      'permissions.create', 'permissions.read', 'permissions.update', 'permissions.delete'
    ]

    if (systemPermissions.includes(existingPermission.name)) {
      return NextResponse.json({ error: 'Cannot delete system permissions' }, { status: 400 })
    }

    // Delete permission (this will cascade to role_permissions due to foreign key constraints)
    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting permission:', error)
      return NextResponse.json({ error: 'Failed to delete permission' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Permission deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}