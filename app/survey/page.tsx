"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 타입 정의
type Answer = 
  | { type: "single"; qid: string; value: string }
  | { type: "multi"; qid: string; values: string[] }
  | { type: "score10"; qid: string; items: { key: string; score: number }[] }
  | { type: "file"; qid: string; files: string[] }

type SurveyState = {
  sectionIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6
  pageIndex: number
  answers: Record<string, Answer | undefined>
}

// 안전한 접근을 위한 타입 가드
function isSingle(a: Answer | undefined): a is Extract<Answer, { type: "single" }> {
  return a?.type === "single";
}
function isMulti(a: Answer | undefined): a is Extract<Answer, { type: "multi" }> {
  return a?.type === "multi";
}
function isScore10(a: Answer | undefined): a is Extract<Answer, { type: "score10" }> {
  return a?.type === "score10";
}
function isFileAns(a: Answer | undefined): a is Extract<Answer, { type: "file" }> {
  return a?.type === "file";
}

// 선택 상태 계산 (single/multi 공용)
function isOptionSelected(ans: Answer | undefined, option: string) {
  if (isSingle(ans)) return ans.value === option;
  if (isMulti(ans)) return ans.values.includes(option);
  return false;
}

// multi 토글 유틸
function toggleMultiValues(current: string[] | undefined, option: string) {
  const base = current ?? [];
  return base.includes(option) ? base.filter(v => v !== option) : [...base, option];
}

// 공통 컴포넌트들
const ProgressSteps = ({ currentSectionIndex, subLabel }: { currentSectionIndex: number; subLabel?: string }) => {
  return (
    <div className="progress-container">
      <div className="progress-steps">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`progress-dot ${index <= currentSectionIndex ? 'active' : ''}`}
          />
        ))}
      </div>
      {subLabel && <div className="progress-sublabel">{subLabel}</div>}
    </div>
  )
}

const ChoiceCard = ({ 
  children, 
  selected, 
  onClick, 
  className = "" 
}: { 
  children: React.ReactNode
  selected: boolean
  onClick: () => void
  className?: string
}) => {
  return (
    <button
      className={`choice-card ${selected ? 'selected' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const StepNav = ({ 
  onPrev, 
  onNext, 
  showPrev, 
  nextLabel = "다음",
  nextDisabled = false 
}: {
  onPrev?: () => void
  onNext: () => void
  showPrev: boolean
  nextLabel?: string
  nextDisabled?: boolean
}) => {
  return (
    <div className="step-nav">
      {showPrev && (
        <button className="step-nav-btn prev" onClick={onPrev}>
          이전
        </button>
      )}
      <button 
        className={`step-nav-btn next ${nextDisabled ? 'disabled' : ''}`}
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel}
      </button>
    </div>
  )
}

const ScoreAllocator10 = ({ 
  items, 
  values, 
  onChange 
}: {
  items: { key: string; label: string; description?: string }[]
  values: Record<string, number>
  onChange: (key: string, value: number) => void
}) => {
  const total = Object.values(values).reduce((sum, val) => sum + val, 0)
  
  return (
    <div className="score-allocator">
      <div className="score-header">
        현재 배분: {total} / 10
      </div>
      <div className="score-items">
        {items.map((item) => (
          <div key={item.key} className="score-item">
            <div className="score-item-info">
              <div className="score-item-label">{item.label}</div>
              {item.description && (
                <div className="score-item-description">{item.description}</div>
              )}
            </div>
            <div className="score-stepper">
              <button
                className="stepper-btn"
                onClick={() => onChange(item.key, Math.max(0, (values[item.key] || 0) - 1))}
                disabled={(values[item.key] || 0) <= 0}
              >
                -
              </button>
              <span className="stepper-value">{values[item.key] || 0}</span>
              <button
                className="stepper-btn"
                onClick={() => onChange(item.key, Math.min(5, (values[item.key] || 0) + 1))}
                disabled={(values[item.key] || 0) >= 5 || total >= 10}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 메인 설문 컴포넌트
export default function SurveyPage() {
  const router = useRouter()
  const [surveyState, setSurveyState] = useState<SurveyState>({
    sectionIndex: 0,
    pageIndex: 0,
    answers: {}
  })
  const [showProductModal, setShowProductModal] = useState(false)

  // 현재 페이지 정보 계산
  const getCurrentPageInfo = () => {
    const { sectionIndex, pageIndex } = surveyState
    
    // 인트로 페이지 (성별/나이대)
    if (sectionIndex === 0 && pageIndex === 0) {
      return { type: 'intro', title: '기본 정보' }
    }
    
    // 섹션 1: 관심사 & 선호
    if (sectionIndex === 1) {
      const questions = [
        { type: 'score10', title: '개선 목표', qid: 'q1' },
        { type: 'multi', title: '제품 선택 기준', qid: 'q2' },
        { type: 'multi', title: '스킨케어 단계 선호', qid: 'q3' },
        { type: 'score10', title: '제품 추천 기준', qid: 'q4' },
        { type: 'multi', title: '스킨케어 예산', qid: 'q5' }
      ]
      return questions[pageIndex] || { type: 'unknown', title: '알 수 없음' }
    }
    
    // 섹션 2: 바우만 16타입
    if (sectionIndex === 2) {
      const titles = ['수분/유분(Dry/Oil)', '민감성(Sensitive/Resistant)', '색소(Pigmented/Non-pigmented)', '주름/탄력(Wrinkled/Tight)']
      return { type: 'baumann', title: titles[pageIndex] || '바우만 타입' }
    }
    
    // 섹션 3: 정밀 분석
    if (sectionIndex === 3) {
      return { type: 'detailed', title: '정밀 분석' }
    }
    
    // 섹션 4: 생활습관
    if (sectionIndex === 4) {
      return { type: 'lifestyle', title: '생활·행동 습관' }
    }
    
    // 섹션 5: 사진 업로드
    if (sectionIndex === 5) {
      return { type: 'photo', title: '사진 업로드 & 동의' }
    }
    
    // 섹션 6: 제품 등록
    if (sectionIndex === 6) {
      return { type: 'product', title: '제품 등록' }
    }
    
    return { type: 'unknown', title: '알 수 없음' }
  }

  const currentPageInfo = getCurrentPageInfo()

  // 답변 업데이트 함수
  const updateAnswer = (qid: string, answer: Answer) => {
    setSurveyState(prev => {
      if (!prev) return prev
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [qid]: answer
        }
      }
    })
  }

  // 다음 페이지로 이동
  const goToNext = () => {
    // 섹션 6에서 제품 등록 모달 표시
    if (surveyState.sectionIndex === 6 && surveyState.pageIndex === 0) {
      setShowProductModal(true)
      return
    }
    
    // 마지막 페이지에서 결과 페이지로
    if (surveyState.sectionIndex === 6 && surveyState.pageIndex === 1) {
      router.push('/survey/results')
      return
    }
    
    // 일반적인 다음 페이지 로직
    setSurveyState(prev => {
      if (!prev) return prev
      
      const maxPagesInSection = getMaxPagesInSection(prev.sectionIndex)
      
      if (prev.pageIndex < maxPagesInSection - 1) {
        return { ...prev, pageIndex: prev.pageIndex + 1 }
      } else if (prev.sectionIndex < 6) {
        return { ...prev, sectionIndex: (prev.sectionIndex + 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6, pageIndex: 0 }
      }
      
      return prev
    })
  }

  // 이전 페이지로 이동
  const goToPrev = () => {
    setSurveyState(prev => {
      if (!prev) return prev
      
      if (prev.pageIndex > 0) {
        return { ...prev, pageIndex: prev.pageIndex - 1 }
      } else if (prev.sectionIndex > 0) {
        const prevSectionIndex = (prev.sectionIndex - 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6
        const maxPages = getMaxPagesInSection(prevSectionIndex)
        return { 
          ...prev, 
          sectionIndex: prevSectionIndex, 
          pageIndex: maxPages - 1 
        }
      }
      return prev
    })
  }

  // 섹션별 최대 페이지 수
  const getMaxPagesInSection = (sectionIndex: number): number => {
    switch (sectionIndex) {
      case 0: return 1 // 인트로
      case 1: return 5 // 관심사 & 선호
      case 2: return 4 // 바우만 16타입
      case 3: return 8 // 정밀 분석
      case 4: return 15 // 생활습관
      case 5: return 2 // 사진 업로드
      case 6: return 2 // 제품 등록
      default: return 1
    }
  }

  // 현재 페이지가 첫 페이지인지 확인
  const isFirstPage = surveyState.sectionIndex === 0 && surveyState.pageIndex === 0

  // 현재 페이지가 마지막 페이지인지 확인
  const isLastPage = surveyState.sectionIndex === 6 && surveyState.pageIndex === 1

  // 다음 버튼 활성화 여부 확인
  const isNextDisabled = () => {
    const { sectionIndex, pageIndex } = surveyState
    
    // 인트로 페이지 (성별/나이대)
    if (sectionIndex === 0 && pageIndex === 0) {
      const genderSelected = surveyState.answers.gender && isSingle(surveyState.answers.gender)
      const ageSelected = surveyState.answers.age && isSingle(surveyState.answers.age)
      return !genderSelected || !ageSelected
    }
    
    // 섹션 1: 관심사 & 선호
    if (sectionIndex === 1) {
      if (pageIndex === 0) { // Q1 - 점수제
        const ans = surveyState.answers.q1
        if (!isScore10(ans)) return true
        const total = ans.items.reduce((sum, item) => sum + item.score, 0)
        return total !== 10
      }
      if (pageIndex === 1) { // Q2 - 복수선택
        const ans = surveyState.answers.q2
        return !isMulti(ans) || ans.values.length === 0
      }
      if (pageIndex === 2) { // Q3 - 복수선택
        const ans = surveyState.answers.q3
        return !isMulti(ans) || ans.values.length === 0
      }
      if (pageIndex === 3) { // Q4 - 점수제
        const ans = surveyState.answers.q4
        if (!isScore10(ans)) return true
        const total = ans.items.reduce((sum, item) => sum + item.score, 0)
        return total !== 10
      }
      if (pageIndex === 4) { // Q5 - 단일선택
        const ans = surveyState.answers.q5
        return !isSingle(ans)
      }
    }
    
    // 섹션 2: 바우만 16타입
    if (sectionIndex === 2) {
      if (pageIndex === 0) {
        const questions = ['baumann_do_1', 'baumann_do_2', 'baumann_do_3']
        return questions.some(qid => !isSingle(surveyState.answers[qid]))
      }
    }
    
    return false
  }

  // 제품 등록 모달 처리
  const handleProductModalConfirm = () => {
    setShowProductModal(false)
    setSurveyState(prev => {
      if (!prev) return prev
      return { ...prev, pageIndex: 1 }
    })
  }

  const handleProductModalSkip = () => {
    setShowProductModal(false)
    router.push('/survey/results')
  }

  return (
    <div className="survey-container">
      {/* 프로그레스 바 - 기본 정보 페이지에서는 숨김 */}
      {surveyState.sectionIndex > 0 && (
        <ProgressSteps currentSectionIndex={surveyState.sectionIndex - 1} />
      )}
      
      {/* 페이지 제목 */}
      <div className="survey-header">
        <h1 className="survey-title">{currentPageInfo.title}</h1>
      </div>

      {/* 페이지 내용 */}
      <div className="survey-content" key={`${surveyState.sectionIndex}-${surveyState.pageIndex}`}>
        {renderCurrentPage()}
      </div>

      {/* 네비게이션 */}
      <StepNav
        onPrev={goToPrev}
        onNext={goToNext}
        showPrev={!isFirstPage}
        nextLabel={isLastPage ? "결과 보기" : "다음"}
        nextDisabled={isNextDisabled()}
      />

      {/* 제품 등록 안내 모달 */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-text">루틴 추천은 내 제품 등록 후 진행됩니다</p>
            <div className="modal-buttons">
              <button className="modal-btn secondary" onClick={handleProductModalSkip}>
                나중에 하기
              </button>
              <button className="modal-btn primary" onClick={handleProductModalConfirm}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // 현재 페이지 렌더링
  function renderCurrentPage() {
    const { sectionIndex, pageIndex } = surveyState

    // 인트로 페이지
    if (sectionIndex === 0 && pageIndex === 0) {
      return (
        <div className="intro-cards">
          <div className="intro-card">
            <h3>성별</h3>
            <div className="choice-grid">
              {['여자', '남자', '기타', '응답안함'].map((option) => (
                <ChoiceCard
                  key={option}
                  selected={isOptionSelected(surveyState.answers.gender, option)}
                  onClick={() => updateAnswer('gender', { type: 'single', qid: 'gender', value: option })}
                >
                  {option}
                </ChoiceCard>
              ))}
            </div>
          </div>
          
          <div className="intro-card">
            <h3>나이대</h3>
            <div className="choice-grid">
              {['10대', '20대', '30대', '40대', '50대+'].map((option) => (
                <ChoiceCard
                  key={option}
                  selected={isOptionSelected(surveyState.answers.age, option)}
                  onClick={() => updateAnswer('age', { type: 'single', qid: 'age', value: option })}
                >
                  {option}
                </ChoiceCard>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // 섹션 1: 관심사 & 선호
    if (sectionIndex === 1) {
      if (pageIndex === 0) {
        // Q1. 개선 목표 10점 배분
        const items = [
          { key: 'dry_inner', label: '속건조', description: '세안 직후 당김, 시간이 지나면 번들거림' },
          { key: 'dry_outer', label: '겉건조', description: '겉이 하얗게 일어나거나 각질 잦음' },
          { key: 'barrier', label: '장벽 강화', description: '자극·붉은기 완화, 보호막 강화' },
          { key: 'pigment', label: '색소/미백', description: '잡티·기미·칙칙함 개선' },
          { key: 'wrinkle', label: '주름/탄력', description: '잔주름 예방, 탄력 유지' },
          { key: 'oil', label: '유분/번들', description: '과잉 피지, 번들거림 관리' },
          { key: 'acne', label: '여드름/트러블', description: '뾰루지 억제, 진정' },
          { key: 'blackhead', label: '블랙/화이트헤드', description: '모공 속 피지·각질 케어' }
        ]
        
        const ans = surveyState.answers.q1
        const currentValues = isScore10(ans) 
          ? ans.items.reduce((acc, item) => ({ ...acc, [item.key]: item.score }), {} as Record<string, number>)
          : {} as Record<string, number>

        return (
          <ScoreAllocator10
            items={items}
            values={currentValues}
            onChange={(key, value) => {
              const newItems = items.map(item => ({
                key: item.key,
                score: item.key === key ? value : (currentValues[item.key] || 0)
              }))
              updateAnswer('q1', { type: 'score10', qid: 'q1', items: newItems })
            }}
          />
        )
      }
      
      if (pageIndex === 1) {
        // Q2. 스킨케어 제품을 고를 때 신경 쓰는 점 (복수선택)
        const options = ['산뜻한 제형', '충분한 보습감', '무향 선호', '자연·저자극 성분', '가성비', '프리미엄 브랜드']
        const ans = surveyState.answers.q2
        
        return (
          <div>
            <div className="question-subtitle">복수 선택 가능</div>
            <div className="choice-grid">
              {options.map((option) => (
                <ChoiceCard
                  key={option}
                  selected={isOptionSelected(ans, option)}
                  onClick={() => {
                    const nextValues = toggleMultiValues(isMulti(ans) ? ans.values : undefined, option)
                    updateAnswer('q2', { type: 'multi', qid: 'q2', values: nextValues })
                  }}
                >
                  {option}
                </ChoiceCard>
              ))}
            </div>
          </div>
        )
      }
      
      if (pageIndex === 2) {
        // Q3. 스킨케어 단계에 대한 선호 (복수선택)
        const options = ['단계 많아도 꼼꼼히', '최소 단계 선호', '올인원도 괜찮음']
        const ans = surveyState.answers.q3
        
        return (
          <div>
            <div className="question-subtitle">복수 선택 가능</div>
            <div className="choice-grid">
              {options.map((option) => (
                <ChoiceCard
                  key={option}
                  selected={isOptionSelected(ans, option)}
                  onClick={() => {
                    const nextValues = toggleMultiValues(isMulti(ans) ? ans.values : undefined, option)
                    updateAnswer('q3', { type: 'multi', qid: 'q3', values: nextValues })
                  }}
                >
                  {option}
                </ChoiceCard>
              ))}
            </div>
          </div>
        )
      }
      
      if (pageIndex === 3) {
        // Q4. 제품 추천 기준 10점 배분
        const items = [
          { key: 'ingredient', label: '성분' },
          { key: 'texture', label: '제형' },
          { key: 'price', label: '가격' },
          { key: 'brand', label: '브랜드' }
        ]
        
        const ans = surveyState.answers.q4
        const currentValues = isScore10(ans) 
          ? ans.items.reduce((acc, item) => ({ ...acc, [item.key]: item.score }), {} as Record<string, number>)
          : {} as Record<string, number>

        return (
          <ScoreAllocator10
            items={items}
            values={currentValues}
            onChange={(key, value) => {
              const newItems = items.map(item => ({
                key: item.key,
                score: item.key === key ? value : (currentValues[item.key] || 0)
              }))
              updateAnswer('q4', { type: 'score10', qid: 'q4', items: newItems })
            }}
          />
        )
      }
      
      if (pageIndex === 4) {
        // Q5. 평소 스킨케어 예산 (단일선택)
        const options = ['월 3만 이하', '3~7만', '7~15만', '15만 이상', '그때그때 다름']
        const ans = surveyState.answers.q5
        
        return (
          <div className="choice-grid">
            {options.map((option) => (
              <ChoiceCard
                key={option}
                selected={isOptionSelected(ans, option)}
                onClick={() => {
                  updateAnswer('q5', { type: 'single', qid: 'q5', value: option })
                }}
              >
                {option}
              </ChoiceCard>
            ))}
          </div>
        )
      }
    }
    
    // 섹션 2: 바우만 16타입
    if (sectionIndex === 2) {
      if (pageIndex === 0) {
        // 수분/유분 질문들
        const questions = [
          {
            question: '세안 후 기초제품을 바르는 시간대는?',
            options: ['즉시(1~3분)', '4~10분', '11~30분', '30분+', '거의 안 바름'],
            qid: 'baumann_do_1'
          },
          {
            question: '기초제품 후 3시간 후 느낌은?',
            options: ['너무 건조', '약간 건조', '보통', '약간 번들', '매우 유분'],
            qid: 'baumann_do_2'
          },
          {
            question: '오후 T존 상태는?',
            options: ['매우 건조', '약간 건조', '변화 없음', '약간 유분', '매우 유분'],
            qid: 'baumann_do_3'
          }
        ]
        
        return (
          <div className="baumann-questions">
            {questions.map((q, idx) => (
              <div key={idx} className="baumann-question">
                <h4 className="question-title">{q.question}</h4>
                <div className="choice-grid">
                  {q.options.map((option) => (
                    <ChoiceCard
                      key={option}
                      selected={isOptionSelected(surveyState.answers[q.qid], option)}
                      onClick={() => updateAnswer(q.qid, { type: 'single', qid: q.qid, value: option })}
                    >
                      {option}
                    </ChoiceCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      }
      
      // 나머지 바우만 타입 페이지들 (민감성, 색소, 주름)
      return (
        <div className="placeholder-content">
          <p>바우만 타입 - {['수분/유분', '민감성', '색소', '주름'][pageIndex]}</p>
          <p>이 페이지는 아직 구현 중입니다.</p>
        </div>
      )
    }
    
    // 섹션 5: 사진 업로드
    if (sectionIndex === 5) {
      return (
        <div className="photo-upload-section">
          <div className="upload-instructions">
            <h3>피부 분석을 위한 사진을 업로드해주세요</h3>
            <p className="upload-subtitle">정확한 분석을 위해 아래 가이드를 따라 촬영해주세요</p>
          </div>
          
          <div className="photo-requirements">
            <div className="required-photos">
              <h4>필수 사진</h4>
              <div className="photo-grid">
                <div className="photo-placeholder">
                  <div className="photo-icon">📷</div>
                  <span>정면</span>
                </div>
                <div className="photo-placeholder">
                  <div className="photo-icon">📷</div>
                  <span>좌측면</span>
                </div>
                <div className="photo-placeholder">
                  <div className="photo-icon">📷</div>
                  <span>우측면</span>
                </div>
              </div>
            </div>
            
            <div className="optional-photos">
              <h4>선택 사진</h4>
              <div className="photo-grid">
                <div className="photo-placeholder optional">
                  <div className="photo-icon">📷</div>
                  <span>사선</span>
                </div>
                <div className="photo-placeholder optional">
                  <div className="photo-icon">📷</div>
                  <span>턱선</span>
                </div>
                <div className="photo-placeholder optional">
                  <div className="photo-icon">📷</div>
                  <span>이마 클로즈업</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="consent-section">
            <div className="consent-item">
              <label className="consent-label">
                <input type="checkbox" className="consent-checkbox" />
                <span>개인정보 수집 및 이용에 동의합니다</span>
              </label>
            </div>
            <div className="consent-item">
              <label className="consent-label">
                <input type="checkbox" className="consent-checkbox" />
                <span>AI 모델 개선을 위한 데이터 활용에 동의합니다 (선택)</span>
              </label>
            </div>
          </div>
        </div>
      )
    }
    
    // 섹션 6: 제품 등록
    if (sectionIndex === 6) {
      if (pageIndex === 1) {
        return (
          <div className="product-registration">
            <div className="product-upload-area">
              <div className="upload-placeholder">
                <div className="upload-icon">📷</div>
                <p>제품 사진을 업로드하거나</p>
                <p>검색으로 등록해주세요</p>
              </div>
              <div className="upload-buttons">
                <button className="upload-btn camera">카메라로 촬영</button>
                <button className="upload-btn gallery">갤러리에서 선택</button>
                <button className="upload-btn search">제품 검색</button>
              </div>
            </div>
            
            <div className="registered-products">
              <h4>등록된 제품</h4>
              <div className="product-list">
                <p className="no-products">아직 등록된 제품이 없습니다</p>
              </div>
            </div>
          </div>
        )
      }
    }

    // 임시 플레이스홀더
    return (
      <div className="placeholder-content">
        <p>섹션 {sectionIndex + 1}, 페이지 {pageIndex + 1}</p>
        <p>이 페이지는 아직 구현 중입니다.</p>
      </div>
    )
  }
}
