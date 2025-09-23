'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const dynamic = 'force-dynamic'

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // 로딩 중
    if (!session) {
      router.replace('/login?redirect=/mypage')
      return
    }
  }, [session, status, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">로딩 중...</div>
    )
  }

  if (!session) {
    return null // 리디렉션 중
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-xl font-semibold">마이페이지</h1>
        <p className="mb-4 text-gray-700">{session.user?.email}로 로그인됨</p>
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


