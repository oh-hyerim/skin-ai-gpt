"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = { 
  redirectTo?: string; 
};

export default function Login({ redirectTo }: Props) {
  const router = useRouter();
  const callbackUrl = redirectTo || '/';

  useEffect(() => {
    console.log('[login/Login] mounted, redirectTo:', redirectTo);
  }, [redirectTo]);

  const handleSocialLogin = (provider: string) => {
    console.log(`[login] ${provider} 로그인 시작, callbackUrl:`, callbackUrl);
    signIn(provider, { callbackUrl });
  };

  const handleGuestMode = () => {
    console.log('[login] 둘러보기 클릭 - 홈으로 이동:', callbackUrl);
    router.push(callbackUrl as any);
  };

  return (
    <main id="loginView" style={{padding:"40px 16px", maxWidth: 360, margin:"0 auto"}}>
      <div id="loginOptions">
        <h1 style={{textAlign: "center", marginBottom: 32, fontSize: 24, fontWeight: 600}}>로그인</h1>
        
        <button 
          id="kakaoLoginBtn" 
          onClick={() => alert('카카오 로그인은 준비 중입니다.')} 
          style={{
            width:"100%", 
            height:48, 
            marginBottom:12, 
            background:"#FEE500", 
            border:"none", 
            borderRadius:8, 
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          카카오톡으로 계속하기
        </button>
        
        <button 
          id="googleLoginBtn" 
          onClick={() => handleSocialLogin('google')} 
          style={{
            width:"100%", 
            height:48, 
            marginBottom:16, 
            background:"#fff", 
            border:"1px solid #dadce0", 
            borderRadius:8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Google로 계속하기
        </button>
        
        <div style={{
          marginTop:16, 
          textAlign: "center",
          borderTop: "1px solid #e8eaed",
          paddingTop: 16
        }}>
          <button 
            id="emailLoginBtn" 
            onClick={() => alert('이메일 로그인은 준비 중입니다.')} 
            style={{
              background:"none", 
              border:"none", 
              cursor:"pointer",
              color: "#1a73e8",
              textDecoration: "underline",
              fontSize: 14
            }}
          >
            이메일로 로그인
          </button>
          <span style={{margin: "0 8px", color: "#5f6368"}}> | </span>
          <button 
            id="emailSignupBtn" 
            onClick={() => alert('이메일 회원가입은 준비 중입니다.')} 
            style={{
              background:"none", 
              border:"none", 
              cursor:"pointer",
              color: "#1a73e8",
              textDecoration: "underline",
              fontSize: 14
            }}
          >
            이메일로 회원가입
          </button>
        </div>
        
        <div style={{marginTop:24, textAlign: "center"}}>
          <button 
            id="guestBtn" 
            onClick={handleGuestMode} 
            style={{
              background:"none", 
              border:"none", 
              cursor:"pointer", 
              color:"#5f6368",
              fontSize: 14
            }}
          >
            둘러보기
          </button>
        </div>
      </div>
    </main>
  );
}
