import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'
import { PERMISSIONS } from '@/lib/permissions'

type UserRole = Database['public']['Tables']['user_roles']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Role = Database['public']['Tables']['roles']['Row']

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

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
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
    
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

    // Check if assignment exists and get details
    const { data: assignment, error: fetchError } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(name)
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
    const typedAssignment = assignment as UserRole & { role: Role }
    if (typedAssignment.role?.name === 'super_admin') {
      const { count: superAdminCount, error: countError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', typedAssignment.role_id)

      if (countError) {
        console.error('Error counting super admins:', countError)
        return NextResponse.json({ error: 'Failed to verify super admin count' }, { status: 500 })
      }

      if ((superAdminCount || 0) <= 1) {
        return NextResponse.json({ 
          error: 'Cannot remove the last super admin role' 
        }, { status: 400 })
      }
    }

    // Remove role assignment
    const { error } = await (supabase as any)
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
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
    
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

    // Fetch role assignment
    const { data: assignment, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(*)
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

    // Get user data separately
    const typedAssignment = assignment as UserRole & { role: Role }
    const { data: userData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', typedAssignment.user_id)
      .single()

    // Get assigned_by user data if exists
    let assignedByUser: Profile | null = null
    if (typedAssignment.assigned_by) {
      const { data: assignedByData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', typedAssignment.assigned_by)
        .single()
      assignedByUser = assignedByData
    }

    // Combine the data
    const assignmentWithUser = {
      ...typedAssignment,
      user: userData,
      assigned_by_user: assignedByUser
    }

    return NextResponse.json({ assignment: assignmentWithUser })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}