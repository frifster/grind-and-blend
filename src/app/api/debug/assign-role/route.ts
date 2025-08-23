import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase'

// POST /api/debug/assign-role - Manually assign customer role to current user
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 })
    }

    console.log('Assigning role to user:', user.id)

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Create profile if it doesn't exist
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || ''
        })
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
    }

    // Get customer role ID
    const { data: customerRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'customer')
      .single()

    if (roleError || !customerRole) {
      console.error('Error finding customer role:', roleError)
      return NextResponse.json({ error: 'Customer role not found' }, { status: 500 })
    }

    // Check if user already has this role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role_id', customerRole.id)
      .single()

    if (existingRole) {
      return NextResponse.json({ message: 'User already has customer role' })
    }

    // Assign customer role
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_id: customerRole.id
      })

    if (assignError) {
      console.error('Error assigning role:', assignError)
      return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Customer role assigned successfully',
      userId: user.id,
      roleId: customerRole.id
    })
  } catch (error) {
    console.error('Assign role error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}