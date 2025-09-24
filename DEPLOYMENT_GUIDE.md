# NextAuth 배포 및 환경설정 가이드

## 🎯 목적
NextAuth가 Production / Preview / Local 환경에서 모두 정상 동작하고, Google OAuth redirect_uri_mismatch 에러가 발생하지 않도록 환경설정을 정리합니다.

## 📋 환경별 설정

### 1. Local 개발 환경

#### .env.local 파일 생성
```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gtiiNK1nZXjnnxkGTIcqgWR4oXWKeLlO/o7ezhZXeOM=
GOOGLE_CLIENT_ID=608747786494-uo4lf6oo7gvs3ecme03ltnjs2fto8im9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### 2. Vercel Preview 환경

Vercel Dashboard → Settings → Environment Variables → Preview 탭:
```
NEXTAUTH_URL = https://skin-ai-gpt-ohhyerims-projects.vercel.app
NEXTAUTH_SECRET = /2boILCWJGlKEfhQDCHbPeTT9h1bvjE5zv86g0XYdhA=
GOOGLE_CLIENT_ID = 608747786494-uo4lf6oo7gvs3ecme03ltnjs2fto8im9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
```

### 3. Vercel Production 환경

Vercel Dashboard → Settings → Environment Variables → Production 탭:
```
NEXTAUTH_URL = https://skin-ai-gpt.vercel.app
NEXTAUTH_SECRET = oGSs5QVJ1DQsRHy3t2sSw2OWjhe6B7TXPQUUbZ796CM=
GOOGLE_CLIENT_ID = 608747786494-uo4lf6oo7gvs3ecme03ltnjs2fto8im9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
```

## 🔧 Google OAuth 클라이언트 설정

### Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. APIs & Services → Credentials → OAuth 2.0 Client IDs 선택
3. 웹 애플리케이션 클라이언트 편집

#### Authorized JavaScript origins
```
https://skin-ai-gpt.vercel.app
https://skin-ai-gpt-ohhyerims-projects.vercel.app
http://localhost:3000
```

#### Authorized redirect URIs
```
https://skin-ai-gpt.vercel.app/api/auth/callback/google
https://skin-ai-gpt-ohhyerims-projects.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

## 📁 파일 구조 확인

### NextAuth 설정 파일
```
app/api/auth/[...nextauth]/route.ts
```

### 환경변수 파일
```
.env.local          # Local 개발용 (git에 포함되지 않음)
.env.local.example  # 환경변수 예시 파일
```

## 🔒 보안 설정

### .gitignore 확인
```gitignore
# 환경변수 파일
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### NEXTAUTH_SECRET 생성
```bash
# 새로운 시크릿 생성
openssl rand -base64 32
```

## 🚀 배포 체크리스트

### 1. 환경변수 설정 확인
- [ ] Local: `.env.local` 파일 생성
- [ ] Preview: Vercel Preview 환경변수 설정
- [ ] Production: Vercel Production 환경변수 설정

### 2. Google OAuth 설정 확인
- [ ] Authorized JavaScript origins 등록
- [ ] Authorized redirect URIs 등록
- [ ] 클라이언트 ID/Secret 환경변수 설정

### 3. NextAuth 설정 확인
- [ ] `app/api/auth/[...nextauth]/route.ts` 파일 존재
- [ ] Google Provider 설정 완료
- [ ] 콜백 함수 설정 (필요시)

### 4. 테스트
- [ ] Local 환경에서 로그인 테스트
- [ ] Preview 환경에서 로그인 테스트  
- [ ] Production 환경에서 로그인 테스트

## 🐛 트러블슈팅

### redirect_uri_mismatch 에러
1. **원인**: Google OAuth 설정의 redirect URI와 실제 요청 URI가 불일치
2. **해결방법**:
   - DevTools → Network 탭에서 실제 redirect_uri 값 확인
   - Google Cloud Console에서 해당 URI 추가
   - 대소문자, 슬래시(/) 등 정확히 일치해야 함

### 환경변수 인식 안됨
1. **원인**: 환경변수 파일명 오타 또는 Vercel 설정 누락
2. **해결방법**:
   - 파일명 확인: `.env.local` (점으로 시작)
   - Vercel 환경변수 설정 확인
   - 서버 재시작 후 테스트

### 세션 정보 없음
1. **원인**: NextAuth Provider 설정 누락
2. **해결방법**:
   - `app/layout.tsx`에서 SessionProvider 래핑 확인
   - 클라이언트 컴포넌트에서 `useSession` 사용

## 📊 디버깅 도구

### /auth-debug 페이지 활용
현재 환경의 NextAuth 설정을 확인할 수 있습니다:
```
http://localhost:3000/auth-debug
https://your-domain.vercel.app/auth-debug
```

### API 엔드포인트 테스트
```
GET /api/debug-auth
```

## 🔄 환경별 URL 패턴

| 환경 | URL 패턴 | 예시 |
|------|----------|------|
| Local | `http://localhost:3000` | `http://localhost:3000/api/auth/callback/google` |
| Preview | `https://{project}-{user}.vercel.app` | `https://skin-ai-gpt-ohhyerims-projects.vercel.app/api/auth/callback/google` |
| Production | `https://{domain}.vercel.app` | `https://skin-ai-gpt.vercel.app/api/auth/callback/google` |

## ✅ 최종 검증

각 환경에서 다음을 확인하세요:

1. **로그인 플로우**:
   - 로그인 버튼 클릭 → Google 로그인 페이지 이동
   - Google 계정 선택 → 권한 승인
   - 앱으로 리다이렉트 → 로그인 상태 확인

2. **네트워크 요청**:
   - DevTools → Network → `accounts.google.com` 요청
   - `redirect_uri` 파라미터 값이 Google OAuth 설정과 일치하는지 확인

3. **세션 상태**:
   - `useSession()` 훅으로 세션 정보 확인
   - 로그아웃 기능 정상 동작 확인
