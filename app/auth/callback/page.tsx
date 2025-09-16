'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function OAuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabase()

    const checkSession = async () => {
      // 1) If implicit hash tokens are present, set session directly
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        const hash = window.location.hash.replace(/^#/, '')
        const params = new URLSearchParams(hash)
        const access_token = params.get('access_token') || ''
        const refresh_token = params.get('refresh_token') || ''
        if (access_token && refresh_token) {
          try {
            await supabase.auth.setSession({ access_token, refresh_token })
            window.history.replaceState({}, '', window.location.pathname)
            router.replace('/mypage')
            return
          } catch (_e) {
            // fallthrough to next steps
          }
        }
      }

      // 2) Try to complete PKCE/code flow if present
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href)
      } catch (_e) {
        // ignore; continue to check existing session or hash flow
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) router.replace('/mypage')
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/mypage')
    })

    // Fallback in case the event fired before subscription
    checkSession()

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow">
        로그인 처리 중...
      </div>
    </div>
  )
}



