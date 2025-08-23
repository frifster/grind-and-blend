'use client'

import React, { useState, useEffect } from 'react'
// TEMPORARILY DISABLED: Permission checking system
// import { usePermissions } from '@/hooks/usePermissions'
// import { PERMISSIONS } from '@/lib/permissions'
import RoleManager from './RoleManager'
import UserRoleManager from './UserRoleManager'
import { useAuth } from '@/contexts/AuthContext'

interface AdminDashboardProps {
  className?: string
}

type TabType = 'roles' | 'users' | 'permissions'

export default function AdminDashboard({ className = '' }: AdminDashboardProps) {
  // TEMPORARILY DISABLED: Permission checking - only verify authentication
  // const { hasPermission, loading } = usePermissions()
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('roles')

  const tabs = [
    {
      id: 'roles' as TabType,
      name: 'Role Management',
      // permission: PERMISSIONS.ROLES_CREATE, // TEMPORARILY DISABLED
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 'users' as TabType,
      name: 'User Roles',
      // permission: PERMISSIONS.USERS_UPDATE, // TEMPORARILY DISABLED
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'permissions' as TabType,
      name: 'Permissions',
      // permission: PERMISSIONS.ROLES_READ, // TEMPORARILY DISABLED
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  // TEMPORARILY DISABLED: Permission-based tab filtering - show all tabs
  // const availableTabs = tabs.filter(tab => hasPermission(tab.permission))
  const availableTabs = tabs // Show all tabs for authenticated users

  // Set default tab to first available tab if current tab is not accessible
  useEffect(() => {
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id || 'roles')
    }
  }, [availableTabs, activeTab])

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // TEMPORARILY DISABLED: Permission checks - only verify authentication
  if (!user) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h3 className="font-medium">Access Denied</h3>
          <p className="mt-1">You must be logged in to access the admin dashboard.</p>
        </div>
      </div>
    )
  }



  const renderTabContent = () => {
    switch (activeTab) {
      case 'roles':
        // TEMPORARILY DISABLED: Permission checks - allow access for authenticated users
        return <RoleManager />
        // return hasPermission(PERMISSIONS.ROLES_CREATE) ? (
        //   <RoleManager />
        // ) : (
        //   <div className="p-6 text-center text-gray-500">
        //     You don&apos;t have permission to manage roles.
        //   </div>
        // )
      
      case 'users':
        // TEMPORARILY DISABLED: Permission checks - allow access for authenticated users
        return <UserRoleManager />
        // return hasPermission(PERMISSIONS.USERS_UPDATE) ? (
        //   <UserRoleManager />
        // ) : (
        //   <div className="p-6 text-center text-gray-500">
        //     You don&apos;t have permission to manage user roles.
        //   </div>
        // )
      
      case 'permissions':
        // TEMPORARILY DISABLED: Permission checks - allow access for authenticated users
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Permission Management</h2>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <h3 className="font-medium">Coming Soon</h3>
              <p className="mt-1">Permission management interface will be available in a future update.</p>
            </div>
          </div>
        )
        // return hasPermission(PERMISSIONS.ROLES_READ) ? (
        //   <div className="p-6">
        //     <h2 className="text-2xl font-bold text-gray-900 mb-6">Permission Management</h2>
        //     <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
        //       <h3 className="font-medium">Coming Soon</h3>
        //       <p className="mt-1">Permission management interface will be available in a future update.</p>
        //     </div>
        //   </div>
        // ) : (
        //   <div className="p-6 text-center text-gray-500">
        //     You don&apos;t have permission to manage permissions.
        //   </div>
        // )
      
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Select a tab to get started.
          </div>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage roles, permissions, and user access
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}