import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase'

// GET /api/debug/user-roles - Debug user roles
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 })
    }

    console.log('Debug - User ID:', user.id)

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Debug - Profile:', profile)
    console.log('Debug - Profile Error:', profileError)

    // Check user roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)

    console.log('Debug - User Roles:', userRoles)
    console.log('Debug - User Roles Error:', userRolesError)

    // Check all roles
    const { data: allRoles, error: rolesError } = await supabase
      .from('roles')
      .select('*')

    console.log('Debug - All Roles:', allRoles)
    console.log('Debug - Roles Error:', rolesError)

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile,
      userRoles,
      allRoles,
      errors: {
        profileError,
        userRolesError,
        rolesError
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}