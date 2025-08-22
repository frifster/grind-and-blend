'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface LoginFormProps {
  onClose?: () => void
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const { signIn, signUp, resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Check your email for the confirmation link!')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onClose?.()
          router.refresh()
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    
    const { error } = await resetPassword(email)
    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the password reset link!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--primary-color)', border: '2px solid var(--secondary-color)' }}>
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--accent-color)' }}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626' }}>
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1" style={{ color: 'var(--accent-color)' }}>
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
              style={{ 
                border: '2px solid var(--secondary-color)', 
                backgroundColor: 'var(--primary-color)',
                color: 'var(--accent-color)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-color-2)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--secondary-color)'}
              placeholder="Enter your full name"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--accent-color)' }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
            style={{ 
              border: '2px solid var(--secondary-color)', 
              backgroundColor: 'var(--primary-color)',
              color: 'var(--accent-color)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-color-2)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--secondary-color)'}
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--accent-color)' }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
            style={{ 
              border: '2px solid var(--secondary-color)', 
              backgroundColor: 'var(--primary-color)',
              color: 'var(--accent-color)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-color-2)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--secondary-color)'}
            placeholder="Enter your password"
            minLength={6}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-md focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--accent-color-2)',
            color: 'var(--accent-color)',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'var(--accent-color)';
              e.currentTarget.style.color = 'var(--secondary-color)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'var(--accent-color-2)';
              e.currentTarget.style.color = 'var(--accent-color)';
            }
          }}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      
      <div className="mt-4 text-center space-y-2">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm transition-colors"
          style={{ color: 'var(--accent-color-2)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-color-2)'}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
        
        {!isSignUp && (
          <div>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="text-sm transition-colors disabled:opacity-50"
              style={{ color: 'var(--accent-color-2)' }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.color = 'var(--accent-color)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.color = 'var(--accent-color-2)';
              }}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
      
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-sm transition-colors"
          style={{ color: 'var(--secondary-color)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--secondary-color)'}
        >
          Cancel
        </button>
      )}
    </div>
  )
}