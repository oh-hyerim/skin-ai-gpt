'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleLogin = async () => {
    setError(null)
    setLoading(true)
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      console.error('Email login error:', error)
      setError(error.message)
      return
    }
    router.push('/index.html')
  }

  const handleGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    const supabase = getSupabase()
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent('/index.html')}`
      : undefined
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
        <h1 className="mb-4 text-xl font-semibold">로그인</h1>

        <div className="mb-3">
          <input
            type="email"
            id="login-email"
            name="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            id="login-password"
            name="password"
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
          onClick={handleLogin}
          disabled={loading}
          className="mb-2 w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '이메일로 로그인'}
        </button>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full rounded border border-gray-300 bg-white p-2 hover:bg-gray-50"
        >
          {googleLoading ? '구글로 로그인 중...' : '구글로 로그인'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          계정이 없으신가요? <a href="/signup" className="text-blue-600 hover:underline">회원가입</a>
        </p>
      </div>
    </div>
  )
}


