'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSignup = async () => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      console.error('Email signup error:', error)
      setError(error.message)
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const em = session?.user?.email || email
      if (typeof window !== 'undefined' && window.parent) {
        window.parent.postMessage({ source: 'skin-app', type: 'auth:login', email: em }, '*')
      }
    } catch (_) {}
    router.push('/')
  }

  const handleGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    const redirectTo = window.location.origin + '/'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
    if (error) {
      console.error('Google OAuth error:', error)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-semibold">회원가입</h1>

        <div className="mb-3">
          <input
            type="email"
            id="signup-email"
            name="email"
            autoComplete="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            id="signup-password"
            name="password"
            autoComplete="new-password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {error && (
          <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>
        )}

        <button
          type="button"
          onClick={handleSignup}
          disabled={loading || email.trim() === '' || password.trim() === ''}
          className="mb-2 w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '가입 중...' : '이메일로 회원가입'}
        </button>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full rounded border border-gray-300 bg-white p-2 hover:bg-gray-50"
        >
          {googleLoading ? '구글로 로그인 중...' : '구글로 로그인'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          이미 계정이 있으신가요? <a href="/login" className="text-blue-600 hover:underline">로그인</a>
        </p>
      </div>
    </div>
  )
}