'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import getSupabase from '../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function MyPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const supabase = getSupabase()

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user || null
      if (!user) {
        router.replace('/login')
        return
      }
      setEmail(user.email ?? '')
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">로딩 중...</div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-xl font-semibold">마이페이지</h1>
        <p className="mb-4 text-gray-700">{email}로 로그인됨</p>
        <button
          onClick={handleLogout}
          className="w-full rounded border border-gray-300 bg-white p-2 hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}


