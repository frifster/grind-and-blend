'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import UserMenu from './UserMenu'
import LoginForm from './LoginForm'

interface AuthButtonProps {
  className?: string
}

export default function AuthButton({ className = '' }: AuthButtonProps) {
  const [showLoginForm, setShowLoginForm] = useState(false)
  const { user, loading } = useAuth()

  // Handle ESC key to close the login form
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLoginForm) {
        setShowLoginForm(false)
      }
    }

    if (showLoginForm) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [showLoginForm])

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (user) {
    return <UserMenu className={className} />
  }

  return (
    <>
      <button
        onClick={() => setShowLoginForm(true)}
        className={`px-4 py-2 rounded-md focus:outline-none transition-colors ${className}`}
        style={{
          backgroundColor: 'var(--accent-color-2)',
          color: 'var(--accent-color)',
          fontWeight: '600'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-color)';
          e.currentTarget.style.color = 'var(--secondary-color)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-color-2)';
          e.currentTarget.style.color = 'var(--accent-color)';
        }}
      >
        Sign In
      </button>

      {showLoginForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLoginForm(false)}
        >
          <div 
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <LoginForm onClose={() => setShowLoginForm(false)} />
          </div>
        </div>
      )}
    </>
  )
}