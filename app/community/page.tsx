'use client'

import BackButton from '../../components/BackButton'

export default function CommunityPage() {
  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="flex justify-between items-center mb-6">
        <BackButton>← 뒤로</BackButton>
        <h1 className="text-xl font-semibold">커뮤니티</h1>
        <div></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">커뮤니티 페이지</h2>
          <p className="text-gray-600">곧 출시 예정입니다.</p>
        </div>
      </div>
    </div>
  )
}
