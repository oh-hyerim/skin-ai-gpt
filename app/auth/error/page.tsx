"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "서버 설정에 문제가 있습니다. 관리자에게 문의하세요.";
      case "AccessDenied":
        return "접근이 거부되었습니다. 권한을 확인해주세요.";
      case "Verification":
        return "인증 토큰이 만료되었거나 이미 사용되었습니다.";
      case "Default":
        return "로그인 중 오류가 발생했습니다.";
      default:
        return "알 수 없는 오류가 발생했습니다.";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            로그인 오류
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/login"
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            다시 로그인하기
          </Link>
          
          <Link
            href="/"
            className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              <strong>개발 모드 디버그 정보:</strong>
              <br />
              Error: {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
