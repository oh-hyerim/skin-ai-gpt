# Vercel 환경변수 설정 가이드

## 🚀 Vercel 배포 설정

### 1. Vercel Dashboard 접속
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → Settings → Environment Variables

### 2. Production 환경변수 설정
**Production 탭에서 다음 변수들을 추가:**

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXTAUTH_URL` | `https://skin-ai-gpt.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `oGSs5QVJ1DQsRHy3t2sSw2OWjhe6B7TXPQUUbZ796CM=` | Production |
| `GOOGLE_CLIENT_ID` | `608747786494-uo4lf6oo7gvs3ecme03ltnjs2fto8im9.apps.googleusercontent.com` | Production |
| `GOOGLE_CLIENT_SECRET` | `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` | Production |

### 3. Preview 환경변수 설정
**Preview 탭에서 다음 변수들을 추가:**

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXTAUTH_URL` | `https://skin-ai-gpt-ohhyerims-projects.vercel.app` | Preview |
| `NEXTAUTH_SECRET` | `/2boILCWJGlKEfhQDCHbPeTT9h1bvjE5zv86g0XYdhA=` | Preview |
| `GOOGLE_CLIENT_ID` | `608747786494-uo4lf6oo7gvs3ecme03ltnjs2fto8im9.apps.googleusercontent.com` | Preview |
| `GOOGLE_CLIENT_SECRET` | `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` | Preview |

## 🔧 CLI를 통한 환경변수 설정

### Vercel CLI 설치
```bash
npm i -g vercel
vercel login
```

### Production 환경변수 설정
```bash
vercel env add NEXTAUTH_URL production
# 입력: https://skin-ai-gpt.vercel.app

vercel env add NEXTAUTH_SECRET production
# 입력: oGSs5QVJ1DQsRHy3t2sSw2OWjhe6B7TXPQUUbZ796CM=

vercel env add GOOGLE_CLIENT_ID production
# 입력: 608747786494-uo4lf6oo7gvs3ecme03ltnjs2fto8im9.apps.googleusercontent.com

vercel env add GOOGLE_CLIENT_SECRET production
# 입력: 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
```

### Preview 환경변수 설정
```bash
vercel env add NEXTAUTH_URL preview
# 입력: https://skin-ai-gpt-ohhyerims-projects.vercel.app

vercel env add NEXTAUTH_SECRET preview
# 입력: /2boILCWJGlKEfhQDCHbPeTT9h1bvjE5zv86g0XYdhA=

vercel env add GOOGLE_CLIENT_ID preview
# 입력: 608747786494-uo4lf6oo7gvs3ecme03ltnjs2fto8im9.apps.googleusercontent.com

vercel env add GOOGLE_CLIENT_SECRET preview
# 입력: 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
```

## 📋 환경변수 확인
```bash
# 모든 환경변수 조회
vercel env ls

# 특정 환경의 환경변수 조회
vercel env ls --environment production
vercel env ls --environment preview
```

## 🔄 배포 후 확인사항

### 1. 환경변수 적용 확인
```bash
# 디버그 페이지에서 확인
https://skin-ai-gpt.vercel.app/auth-debug
https://skin-ai-gpt-ohhyerims-projects.vercel.app/auth-debug
```

### 2. Google OAuth 콜백 URL 확인
- Production: `https://skin-ai-gpt.vercel.app/api/auth/callback/google`
- Preview: `https://skin-ai-gpt-ohhyerims-projects.vercel.app/api/auth/callback/google`

### 3. 로그인 테스트
각 환경에서 Google 로그인이 정상 작동하는지 확인

## ⚠️ 주의사항

1. **환경변수 변경 후 재배포 필요**
   - 환경변수 변경 시 자동으로 재배포되지 않음
   - 수동으로 재배포하거나 새 커밋 푸시 필요

2. **NEXTAUTH_URL 정확성**
   - 반드시 실제 배포 URL과 일치해야 함
   - 슬래시(/) 포함 여부 주의

3. **Secret 보안**
   - 각 환경마다 다른 NEXTAUTH_SECRET 사용 권장
   - Secret 노출 시 즉시 재생성

## 🐛 트러블슈팅

### 환경변수가 인식되지 않는 경우
1. Vercel Dashboard에서 환경변수 설정 확인
2. 올바른 환경(Production/Preview)에 설정했는지 확인
3. 재배포 실행

### redirect_uri_mismatch 에러
1. Google Cloud Console에서 Authorized redirect URIs 확인
2. 실제 콜백 URL과 정확히 일치하는지 확인
3. 대소문자, 프로토콜(https/http) 정확히 일치해야 함

### 로그인 후 세션이 유지되지 않는 경우
1. NEXTAUTH_SECRET 설정 확인
2. 쿠키 도메인 설정 확인
3. HTTPS 환경에서 테스트
