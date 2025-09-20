"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabase()
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href)
      } catch (_) {}
      router.replace('/')
    }
    run()
  }, [router])

  return null
}


