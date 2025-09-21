import LoginBoundary from "./LoginBoundary";

// 정적 프리렌더를 피하고 동적으로 처리
export const dynamic = "force-dynamic";

export default function Page() {
  return <LoginBoundary />;
}


