'use client'

import React, { useState, useEffect } from 'react'
import { useRoles } from '@/hooks/useRoles'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Profile, Role } from '@/lib/supabase'

interface UserRoleManagerProps {
  className?: string
}

interface UserWithRoles extends Profile {
  user_roles: Array<{
    role: Role
  }>
}

export default function UserRoleManager({ className = '' }: UserRoleManagerProps) {
  const { user } = useAuth()
  const { roles, userRoles, assignRole, removeRole, loading: rolesLoading } = useRoles()
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            role:roles(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !selectedRole) return

    setIsSubmitting(true)
    try {
      const success = await assignRole(selectedUser.id, selectedRole)
      if (success) {
        await fetchUsers() // Refresh the user list
        setSelectedUser(null)
        setSelectedRole('')
        setIsAssignModalOpen(false)
      }
    } catch (error) {
      console.error('Failed to assign role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveRole = async (userId: string, roleId: string) => {
    if (!confirm('Are you sure you want to remove this role from the user?')) {
      return
    }

    try {
      const success = await removeRole(userId, roleId)
      if (success) {
        await fetchUsers() // Refresh the user list
      }
    } catch (error) {
      console.error('Failed to remove role:', error)
    }
  }

  const openAssignModal = (user: UserWithRoles) => {
    setSelectedUser(user)
    setIsAssignModalOpen(true)
  }

  const closeModal = () => {
    setIsAssignModalOpen(false)
    setSelectedUser(null)
    setSelectedRole('')
  }

  const getUserRoles = (user: UserWithRoles): Role[] => {
    return user.user_roles?.map(ur => ur.role) || []
  }

  const getAvailableRoles = (user: UserWithRoles): Role[] => {
    const userRoleIds = getUserRoles(user).map(role => role.id)
    return roles.filter(role => !userRoleIds.includes(role.id))
  }

  if (loading || rolesLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Role Management</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((userProfile) => {
              const userRolesList = getUserRoles(userProfile)
              return (
                <tr key={userProfile.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {userProfile.full_name?.charAt(0) || userProfile.email?.charAt(0) || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {userProfile.full_name || 'No name'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{userProfile.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {userRolesList.length > 0 ? (
                        userRolesList.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role.name}
                            <button
                              onClick={() => handleRemoveRole(userProfile.id, role.id)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                              title="Remove role"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userProfile.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userProfile.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openAssignModal(userProfile)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Assign Role
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Assign Role Modal */}
      {isAssignModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Role to {selectedUser.full_name || selectedUser.email}
              </h3>
              <form onSubmit={handleAssignRole}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a role...</option>
                    {getAvailableRoles(selectedUser).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {getAvailableRoles(selectedUser).length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      All available roles have been assigned to this user.
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedRole}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'Assigning...' : 'Assign Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}