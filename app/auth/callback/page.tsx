"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    const run = async () => {
      try {
        // 해시/코드가 있으면 supabase-js가 이 호출 시 세션 저장 처리
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("OAuth callback getSession error:", error);
        }
        // 세션 확인 후 홈으로 이동 (세션 유무와 관계없이 홈으로 이동하여 후속 흐름 처리)
        router.replace("/");
      } catch (e) {
        console.error("OAuth callback error:", e);
        router.replace("/");
      }
    };
    run();
  }, [router]);

  return <div style={{padding:16}}>로그인 처리 중...</div>;
}


