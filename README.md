# 스킨 AI 앱 - 피부 분석 설문 시스템

모바일 우선 피부 분석 설문 시스템입니다. Next.js, React, Tailwind CSS, Zustand를 사용하여 구현되었습니다.

## 주요 기능

### 📱 모바일 우선 설문 시스템
- 한 페이지 = 한 문항 (인트로 페이지 제외)
- 6단계 프로그레스바 (퍼센트 미표시)
- 지정된 컬러 팔레트 적용

### 🎨 컬러 팔레트
- 프로그레스바 활성: `#00EEFF`
- 선택지 테두리(기본): `#00B2FF`
- 선택 후 배경: `#D9F4FF`
- 선택 후 테두리: `#006FFF`
- 이전/다음 버튼: `#B9EAFF`

### 🧩 공통 컴포넌트
- **ProgressSteps**: 6개 dot 프로그레스바
- **ChoiceCard**: 선택 카드 (hover 애니메이션 포함)
- **StepNav**: 이전/다음 네비게이션
- **ScoreAllocator10**: 10점 배분 시스템

### 📋 설문 구성 (6섹션)
1. **인트로**: 성별/나이대 (한 화면 2카드)
2. **관심사 & 선호**: 5문항 (점수제 + 복수선택)
3. **바우만 16타입**: D/O, S/R, P/N, W/T 분석
4. **정밀 분석**: 색소 & 주름 세부 분석
5. **사진 업로드**: 피부 분석용 사진 업로드
6. **제품 등록**: 루틴 추천을 위한 제품 등록

## 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **UI Framework**: React 18
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: Zustand
- **Authentication**: NextAuth.js

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

## 사용법

1. 메인 페이지에서 **분석** 탭으로 이동
2. **프로필** 버튼 클릭하여 설문 시작
3. 6단계 설문 진행
4. 결과 페이지에서 피부 분석 결과 확인

## 프로젝트 구조

```
├── app/
│   ├── page.tsx              # 메인 페이지
│   ├── survey/
│   │   ├── page.tsx          # 설문 페이지
│   │   └── results/
│   │       └── page.tsx      # 결과 페이지
│   └── ...
├── public/
│   └── index.css             # 스타일시트
├── package.json
└── README.md
```

## 라이선스

MIT License