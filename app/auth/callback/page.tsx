"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // 해시/코드가 있으면 supabase-js가 이 호출 시 세션 저장 처리
        await supabase.auth.getSession();
      } catch (e) {
        console.error("OAuth callback error:", e);
      } finally {
        router.replace("/");
      }
    };
    run();
  }, [router]);

  return <div style={{padding:16}}>로그인 처리 중...</div>;
}


