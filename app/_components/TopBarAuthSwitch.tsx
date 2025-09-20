'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../lib/supabaseClient'

export default function TopBarAuthSwitch() {
  const [isAuthed, setAuthed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="w-full flex justify-end p-3">
      {isAuthed ? (
        <button onClick={logout} className="px-3 py-1 rounded border">로그아웃</button>
      ) : (
        <a href="/login" className="px-3 py-1 rounded border">로그인</a>
      )}
    </div>
  )
}


