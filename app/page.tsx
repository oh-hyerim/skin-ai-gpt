import { redirect } from 'next/navigation'

export default function HomePage() {
  // 기본 진입 시, 정적 메인 UI로 이동
  redirect('/index.html')
}


