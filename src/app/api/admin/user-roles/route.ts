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

// GET /api/admin/user-roles - Get all users with their roles
export async function GET(request: NextRequest) {
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

    // Get URL parameters for pagination
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Fetch users with their roles
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(
          role:roles(
            id,
            name,
            description
          ),
          assigned_at,
          assigned_by
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting users:', countError)
      return NextResponse.json({ error: 'Failed to count users' }, { status: 500 })
    }

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/user-roles - Assign a role to a user
export async function POST(request: NextRequest) {
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

    // Parse request body
    const { userId, roleId } = await request.json()
    if (!userId || !roleId) {
      return NextResponse.json({ error: 'User ID and Role ID are required' }, { status: 400 })
    }

    // Check if user exists
    const { data: userExists, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    // Check if user already has this role
    const { data: existingAssignment, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single()

    if (existingAssignment) {
      return NextResponse.json({ error: 'User already has this role' }, { status: 409 })
    }

    // Assign role to user
    const { data: assignment, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: user.id
      })
      .select(`
        *,
        role:roles(id, name, description),
        user:profiles(id, email, full_name)
      `)
      .single()

    if (error) {
      console.error('Error assigning role:', error)
      return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
    }

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}