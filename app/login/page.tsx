"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main>
      <h1>로그인</h1>
      <div id="loginOptions">
        <button onClick={() => signIn("google")}>Google로 로그인</button>
      </div>
    </main>
  );
}


