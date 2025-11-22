import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

import { Database } from '@/types/database.types'

// Create Supabase client for client-side components
export const supabase = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
})

// Types for RBAC
export type Role = Database['public']['Tables']['roles']['Row']
export type Permission = Database['public']['Tables']['permissions']['Row']
export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type RolePermission = Database['public']['Tables']['role_permissions']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

// Extended types with relationships
export interface UserWithRoles extends Profile {
  user_roles: (UserRole & {
    roles: Role & {
      role_permissions: (RolePermission & {
        permissions: Permission
      })[]
    }
  })[]
}

export interface RoleWithPermissions extends Role {
  role_permissions: (RolePermission & {
    permissions: Permission
  })[]
}