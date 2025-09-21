"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const box: React.CSSProperties = { maxWidth: 320, margin: "60px auto", padding: "0 16px" };
  const btn: React.CSSProperties = { width: "100%", height: 44, borderRadius: 10, border: "1px solid #00000014", boxShadow: "0 2px 6px rgba(0,0,0,0.08)", fontSize: 14, fontWeight: 600, marginTop: 12 };
  const kakao: React.CSSProperties = { ...btn, background: "#FEE500" };
  const naver: React.CSSProperties = { ...btn, background: "#03C75A", color: "#fff" };
  const google: React.CSSProperties = { ...btn, background: "#fff" };
  const linkRow: React.CSSProperties = { marginTop: 16, display: "flex", gap: 12, justifyContent: "center", fontSize: 13, color: "#333" };
  const ghost: React.CSSProperties = { marginTop: 10, textAlign: "center", fontSize: 12, color: "#9aa0a6" };

  return (
    <main id="loginView">
      <div style={box}>
        <button id="kakaoLoginBtn" style={kakao} onClick={() => alert("카카오 로그인은 준비 중입니다.")}>
          카카오톡으로 계속하기
        </button>
        <button id="naverLoginBtn" style={naver} onClick={() => alert("네이버 로그인은 준비 중입니다.")}>
          네이버로 계속하기
        </button>
        <button id="googleLoginBtn" style={google} onClick={() => signIn("google")}>
          Google로 계속하기
        </button>

        <div style={linkRow}>
          <button id="emailLoginBtn" onClick={() => alert("이메일 로그인은 준비 중입니다.")} style={{ background:"none", border:"none", cursor:"pointer" }}>
            이메일로 로그인
          </button>
          <span>|</span>
          <button id="emailSignupBtn" onClick={() => alert("이메일 회원가입은 준비 중입니다.")} style={{ background:"none", border:"none", cursor:"pointer" }}>
            이메일로 회원가입
          </button>
        </div>

        <div style={ghost}>
          <button id="guestBtn" onClick={() => router.push("/") } style={{ background:"none", border:"none", cursor:"pointer", color:"#b9bfc6" }}>
            둘러보기
          </button>
        </div>
      </div>
    </main>
  );
}