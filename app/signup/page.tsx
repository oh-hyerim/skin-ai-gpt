'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Google OAuth error:', error)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-semibold">회원가입</h1>
        
        <p className="mb-4 text-sm text-gray-600">
          현재 Google 계정으로만 가입할 수 있습니다.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full rounded border border-gray-300 bg-white p-2 hover:bg-gray-50 disabled:opacity-50"
        >
          {googleLoading ? '구글로 로그인 중...' : '구글로 회원가입'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          이미 계정이 있으신가요? <a href="/login" className="text-blue-600 hover:underline">로그인</a>
        </p>
      </div>
    </div>
  )
}