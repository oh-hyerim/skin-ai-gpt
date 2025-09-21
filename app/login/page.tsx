import Login from "./Login";

// 동적 처리 강제 (로그인 페이지는 정적 생성 부적합)
export const dynamic = "force-dynamic";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type Props = {
  searchParams?: SearchParams;
};

export default function LoginPage({ searchParams }: Props) {
  // callbackUrl 또는 redirect 파라미터 처리
  const redirectTo = 
    typeof searchParams?.callbackUrl === "string" 
      ? decodeURIComponent(searchParams.callbackUrl)
      : typeof searchParams?.redirect === "string"
      ? searchParams.redirect
      : undefined;

  return <Login redirectTo={redirectTo} />;
}

export const metadata = {
  title: "로그인 - Skin AI",
  description: "Skin AI 로그인 페이지",
};