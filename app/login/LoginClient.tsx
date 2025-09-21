"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/dashboard";

  const onGoogle = () => signIn("google", { callbackUrl });

  return (
    <main style={{display:"grid",placeItems:"center",minHeight:"60vh",gap:16}}>
      <h1>Login</h1>
      <button onClick={onGoogle} style={{padding:"10px 16px", border:"1px solid #ccc", borderRadius:8}}>
        Continue with Google
      </button>
    </main>
  );
}


