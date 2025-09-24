"use client";

import { signIn, signOut, useSession } from "next-auth/react";

interface LoginButtonProps {
  callbackUrl?: string;
  className?: string;
}

export default function LoginButton({ 
  callbackUrl = "/", 
  className = "rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50" 
}: LoginButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button disabled className={className}>
        로딩 중...
      </button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {session.user.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl })}
          className={className}
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className={className}
    >
      Google 로그인
    </button>
  );
}
