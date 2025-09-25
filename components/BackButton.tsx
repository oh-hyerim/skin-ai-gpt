"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  children?: React.ReactNode;
  fallbackUrl?: string;
}

export default function BackButton({ 
  className = "rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50", 
  children = "뒤로가기",
  fallbackUrl = "/"
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // 브라우저 히스토리가 있으면 뒤로가기, 없으면 fallbackUrl로 이동
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl as any);
    }
  };

  return (
    <button onClick={handleBack} className={className}>
      {children}
    </button>
  );
}
