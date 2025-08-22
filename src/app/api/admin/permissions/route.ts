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

// GET /api/admin/permissions - Get all permissions
export async function GET(request: NextRequest) {
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

    // Get URL parameters for filtering
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')

    let query = supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: permissions, error } = await query

    if (error) {
      console.error('Error fetching permissions:', error)
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
    }

    // Group permissions by category
    const groupedPermissions = permissions?.reduce((acc: any, permission: any) => {
      const category = permission.category || 'general'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(permission)
      return acc
    }, {})

    return NextResponse.json({ 
      permissions,
      groupedPermissions,
      categories: Object.keys(groupedPermissions || {})
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/permissions - Create a new permission
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.PERMISSIONS_CREATE)
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

    // Create permission
    const { data: permission, error } = await supabase
      .from('permissions')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || 'general'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating permission:', error)
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Permission name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create permission' }, { status: 500 })
    }

    return NextResponse.json({ permission }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}