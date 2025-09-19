"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthHeader() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setEmail(session?.user?.email ?? null);
      } catch {
        if (!isMounted) return;
        setEmail(null);
      }
    };
    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <a href="/" className="font-semibold">Skin</a>
        {email ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">{email}</span>
            <button type="button" onClick={handleLogout} className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">로그아웃</button>
          </div>
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


