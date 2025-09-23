import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AuthCallback() {
  // NextAuth를 사용하므로 이 페이지는 불필요
  // 접근 시 홈으로 리디렉션
  redirect("/");
}


