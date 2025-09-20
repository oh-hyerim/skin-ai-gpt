// @ts-nocheck
import { useState } from 'react'
import { getSupabase } from './lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const supabase = getSupabase()

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      setMessage(`로그인 실패: ${error.message}`)
    } else {
      setMessage(`로그인 성공! user id: ${data.user?.id}`)
    }
  }

  return (
    <div className="p-4">
      <input
        type="email"
        placeholder="이메일"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="password"
        placeholder="비밀번호"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2">
        로그인
      </button>
      <p>{message}</p>
    </div>
  )
}
