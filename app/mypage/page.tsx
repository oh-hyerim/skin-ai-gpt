'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import BackButton from '../../components/BackButton'

export const dynamic = 'force-dynamic'

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // 로딩 중
    if (!session) {
      router.push('/login?redirect=/mypage')
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
        <div className="flex justify-between items-center mb-4">
          <BackButton>← 뒤로</BackButton>
          <h1 className="text-xl font-semibold">마이페이지</h1>
          <div></div>
        </div>
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


