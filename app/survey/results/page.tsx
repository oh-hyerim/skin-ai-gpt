"use client"

import { useRouter } from 'next/navigation'

export default function SurveyResultsPage() {
  const router = useRouter()

  const resultCards = [
    { title: '피부 타입', content: 'DSPT', description: '건성, 민감성, 색소침착, 탄력' },
    { title: '주요 관심사', content: '보습 & 진정', description: '수분 공급과 피부 진정이 필요' },
    { title: '추천 성분', content: '히알루론산', description: '보습과 수분 공급에 효과적' },
    { title: '피해야 할 성분', content: '알코올', description: '건조함을 악화시킬 수 있음' },
    { title: '스킨케어 단계', content: '5단계', description: '클렌징-토너-에센스-크림-선크림' },
    { title: '제품 예산', content: '월 5-10만원', description: '중간 가격대 제품 추천' },
    { title: '생활 습관', content: '개선 필요', description: '수면과 스트레스 관리 필요' },
    { title: '종합 점수', content: '78점', description: '전반적으로 양호한 피부 상태' }
  ]

  return (
    <div className="results-container">
      {/* 헤더 */}
      <div className="results-header">
        <h1 className="results-title">피부 분석 결과</h1>
        <p className="results-subtitle">AI가 분석한 당신의 피부 정보입니다</p>
      </div>

      {/* 결과 카드들 */}
      <div className="results-grid">
        {resultCards.map((card, index) => (
          <div key={index} className="result-card">
            <div className="result-card-header">
              <h3 className="result-card-title">{card.title}</h3>
            </div>
            <div className="result-card-content">
              <div className="result-card-value">{card.content}</div>
              <div className="result-card-description">{card.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 버튼들 */}
      <div className="results-actions">
        <button 
          className="results-btn secondary"
          onClick={() => router.push('/')}
        >
          홈
        </button>
        <button 
          className="results-btn primary"
          onClick={() => router.push('/products')}
        >
          제품 추천
        </button>
      </div>
    </div>
  )
}
