"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const back = sp.get('callbackUrl') || '/';

  useEffect(() => {
    console.log('[login/page] mounted');
  }, []);

  return (
    <main id="loginView" style={{padding:"40px 16px", maxWidth: 360, margin:"0 auto"}}>
      <div id="loginOptions">
        <button id="kakaoLoginBtn" onClick={()=>alert('카카오는 준비 중입니다.')} style={{width:"100%", height:44, marginBottom:8, background:"#FEE500", border:"none", borderRadius:8}}>카카오톡으로 계속하기</button>
        <button id="naverLoginBtn" onClick={()=>alert('네이버는 준비 중입니다.')} style={{width:"100%", height:44, marginBottom:8, background:"#03C75A", color:"#fff", border:"none", borderRadius:8}}>네이버로 계속하기</button>
        <button id="googleLoginBtn" onClick={()=>signIn('google')} style={{width:"100%", height:44, marginBottom:8, background:"#fff", border:"1px solid #ddd", borderRadius:8}}>Google로 계속하기</button>
        <div style={{marginTop:12}}>
          <button id="emailLoginBtn" onClick={()=>alert('이메일 로그인 준비 중')} style={{background:"none", border:"none", cursor:"pointer"}}>이메일로 로그인</button>
          <span> | </span>
          <button id="emailSignupBtn" onClick={()=>alert('이메일 회원가입 준비 중')} style={{background:"none", border:"none", cursor:"pointer"}}>이메일로 회원가입</button>
        </div>
        <div style={{marginTop:10}}>
          <button id="guestBtn" onClick={()=>router.push(back as any)} style={{background:"none", border:"none", cursor:"pointer", color:"#666"}}>둘러보기</button>
        </div>
      </div>
    </main>
  );
}