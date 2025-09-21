import { Suspense } from "react";
import LoginClient from "./LoginClient";

// 정적 프리렌더를 피하고 동적으로 처리
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<main style={{display:"grid",placeItems:"center",minHeight:"60vh"}}>Loading...</main>}>
      <LoginClient />
    </Suspense>
  );
}


