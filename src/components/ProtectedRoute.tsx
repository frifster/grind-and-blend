'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requireAnyPermission?: boolean // If true, user needs ANY of the permissions. If false, user needs ALL permissions
  fallbackPath?: string
  className?: string
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
  requireAnyPermission = false,
  fallbackPath = '/login',
  className = ''
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading: permissionsLoading } = usePermissions()
  const router = useRouter()

  const loading = authLoading || permissionsLoading

  useEffect(() => {
    if (!loading && !user) {
      router.push(fallbackPath)
    }
  }, [user, loading, router, fallbackPath])

  // Show loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
          <p className="text-gray-600">Please wait while we redirect you to the login page.</p>
        </div>
      </div>
    )
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAnyPermission
      ? hasAnyPermission(requiredPermissions)
      : hasAllPermissions(requiredPermissions)

    if (!hasRequiredPermissions) {
      return (
        <div className={`flex items-center justify-center min-h-screen ${className}`}>
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You don&apos;t have the required permissions to access this page.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Required permissions:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {requiredPermissions.map((permission) => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  // Render children if all checks pass
  return <div className={className}>{children}</div>
}

// Higher-order component for easier usage
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}