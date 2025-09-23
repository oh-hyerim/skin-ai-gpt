"use client";

import { useSession, signOut } from "next-auth/react";

export default function AuthHeader() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <a href="/" className="font-semibold">Skin</a>
        {session?.user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">{session.user.email}</span>
            <button type="button" onClick={handleLogout} className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">로그아웃</button>
          </div>
        ) : status === "loading" ? (
          <div className="text-sm text-gray-500">로딩 중...</div>
        ) : (
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm text-blue-600 hover:underline">로그인</a>
            <a href="/signup" className="text-sm text-blue-600 hover:underline">회원가입</a>
          </div>
        )}
      </div>
    </header>
  );
}



