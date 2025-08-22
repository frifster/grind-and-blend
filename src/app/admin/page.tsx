import { Metadata } from 'next'
import AdminDashboard from '@/components/Admin/AdminDashboard'
import ProtectedRoute from '@/components/ProtectedRoute'
import { PERMISSIONS } from '@/lib/permissions'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Grind & Blend',
  description: 'Manage roles, permissions, and user access',
}

export default function AdminPage() {
  return (
    <ProtectedRoute
      requiredPermissions={[PERMISSIONS.ROLES_CREATE, PERMISSIONS.USERS_UPDATE]}
      requireAnyPermission={true}
      fallbackPath="/"
    >
      <AdminDashboard />
    </ProtectedRoute>
  )
}