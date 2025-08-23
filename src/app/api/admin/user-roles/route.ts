import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'

type UserRole = Database['public']['Tables']['user_roles']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Role = Database['public']['Tables']['roles']['Row']

// Create service role client to bypass RLS
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function to check user permissions

// GET /api/admin/user-roles - Get all users with their roles
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    
    // TEMPORARILY DISABLED: Authentication check
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    // if (authError || !user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // TEMPORARILY DISABLED: Permission checking
    // const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.USERS_READ)
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    // }

    // Get URL parameters for pagination
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Fetch users with their roles using a manual join
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Fetch user roles for these users
    const userIds = (profiles as Profile[])?.map(p => p.id) || []
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(
          id,
          name,
          description
        )
      `)
      .in('user_id', userIds)

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError)
      return NextResponse.json({ error: 'Failed to fetch user roles' }, { status: 500 })
    }

    // Combine profiles with their roles
    const users = (profiles as Profile[])?.map(profile => ({
      ...profile,
      user_roles: (userRoles as (UserRole & { role: Role })[])?.filter(ur => ur.user_id === profile.id) || []
    })) || []
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
    const supabase = supabaseAdmin
    
    // TEMPORARILY DISABLED: Authentication check
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    // if (authError || !user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // TEMPORARILY DISABLED: Permission checking
    // const hasPermission = await checkPermission(supabase, user.id, PERMISSIONS.USERS_UPDATE)
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    // }

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
    const { data: existingAssignment } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single()

    if (existingAssignment) {
      return NextResponse.json({ error: 'User already has this role' }, { status: 409 })
    }

    // Assign role to user
    const insertData = {
      user_id: userId,
      role_id: roleId,
      assigned_by: null // Temporarily disabled user tracking
    }
    const { data: assignment, error } = await (supabase as any)
      .from('user_roles')
      .insert(insertData)
      .select(`
        *,
        role:roles(id, name, description)
      `)
      .single()

    if (error) {
      console.error('Error assigning role:', error)
      return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
    }

    // Get user data separately
    const { data: userData } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single()

    // Combine the data
    const assignmentWithUser = {
      ...(assignment as UserRole & { role: Role }),
      user: userData || null
    }

    return NextResponse.json({ assignment: assignmentWithUser }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}