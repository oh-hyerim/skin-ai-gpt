"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleGuestClick = () => {
    // 배경화면(홈)으로 돌아가기
    if (typeof window !== 'undefined') {
      const showView = (targetId: string) => {
        document.querySelectorAll('main').forEach(m => m.classList.add('hidden'));
        const t = document.getElementById(targetId);
        if (t) t.classList.remove('hidden');
      };
      showView('homeView');
    }
  };

  return (
    <main id="loginView" className="hidden">
      <h1>로그인</h1>
      <div id="loginOptions">
        <button id="googleLoginBtn" onClick={() => signIn("google")}>
          Google로 로그인
        </button>
        <button id="guestBtn" onClick={handleGuestClick}>
          둘러보기
        </button>
      </div>
    </main>
  );
}


