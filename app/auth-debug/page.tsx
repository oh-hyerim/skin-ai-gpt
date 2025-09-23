import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // 프리렌더 에러 방지

export default async function AuthDebugPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?redirect=/auth-debug");
  
  return (
    <pre style={{ padding: 16 }}>
      {JSON.stringify(session, null, 2)}
    </pre>
  );
}



