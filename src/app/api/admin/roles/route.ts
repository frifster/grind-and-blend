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

// GET /api/admin/roles - Get all roles
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

    // Fetch roles with permissions
    const { data: roles, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(
          permission:permissions(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching roles:', error)
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
    }

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.ROLES_CREATE)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const { name, description } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    // Create role
    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name: name.trim(),
        description: description?.trim() || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating role:', error)
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Role name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
    }

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}