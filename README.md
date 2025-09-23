# Skin AI GPT

Next.js 기반의 스킨케어 AI 애플리케이션

## 🚀 배포 및 마이그레이션 설정

### 환경별 데이터베이스 연결 설정

#### 로컬 개발 환경
- **파일**: `.env` 또는 `.env.local`
- **DATABASE_URL**: `6543` 포트 (PgBouncer) 사용
- **마이그레이션**: 로컬에서 실행하지 않음 (네트워크 제한으로 인해)

```bash
# 로컬 .env 예시
DATABASE_URL="postgresql://postgres:skinaigpt2025@db.sdgyyiedxbkvvlaepyj.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres:skinaigpt2025@db.sdgyyiedxbkvvlaepyj.supabase.co:5432/postgres?sslmode=require"
```

#### Vercel 배포 환경
- **설정 위치**: Vercel 대시보드 > Project Settings > Environment Variables
- **DATABASE_URL/DIRECT_URL**: `5432` 포트 사용
- **마이그레이션**: 빌드 시 자동 실행 (`npm run migrate:deploy`)

```bash
# Vercel 환경변수 설정
DATABASE_URL=postgresql://postgres:skinaigpt2025@db.sdgyyiedxbkvvlaepyj.supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:skinaigpt2025@db.sdgyyiedxbkvvlaepyj.supabase.co:5432/postgres?sslmode=require

# NextAuth 설정
NEXTAUTH_URL=https://skin-ai-gpt.vercel.app
NEXTAUTH_SECRET=/2boILCWJGlKEfhQDCHbPeTT9h1bvjE5zv86g0XYdhA=

# Google OAuth
GOOGLE_CLIENT_ID=608747786494-uo4lf6oo7gvs3ecme03ltnjs2fto8im9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### 자동 마이그레이션 설정

#### package.json 스크립트
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate",
    "migrate:deploy": "prisma migrate deploy"
  }
}
```

#### vercel.json 빌드 설정
```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build && npm run migrate:deploy"
}
```

## 🔐 인증 설정

### Google OAuth 전용
- **활성화**: Google Provider만 사용
- **비활성화**: 카카오, 이메일 로그인/회원가입
- **로그인 페이지**: `/login`
- **세션 전략**: JWT

### NextAuth 설정
```typescript
// app/api/auth/[...nextauth]/route.ts
const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [GoogleProvider({ ... })],
  pages: { signIn: "/login" },
  // ...
});
```

## 📦 개발 및 배포

### 로컬 개발
```bash
npm install
npm run dev
```

### Vercel 배포
1. Vercel에 프로젝트 연결
2. 환경변수 설정 (위 Vercel 환경변수 참조)
3. 배포 시 자동으로 다음 실행:
   - `npm run build`
   - `npm run migrate:deploy` (Supabase DB에 마이그레이션 적용)

## 🗄️ 데이터베이스

- **Provider**: Supabase PostgreSQL
- **ORM**: Prisma
- **마이그레이션**: Vercel 배포 시 자동 실행
- **스키마**: NextAuth 기본 테이블 (User, Account, Session, VerificationToken)

## 🔧 주요 기능

- Google OAuth 로그인
- JWT 기반 세션 관리
- Prisma ORM을 통한 데이터베이스 관리
- 자동 마이그레이션 배포
- 환경별 데이터베이스 연결 최적화

## 📝 참고사항

- 로컬에서는 5432 포트 접근 제한으로 인해 마이그레이션을 실행하지 않습니다
- 모든 데이터베이스 스키마 변경은 Vercel 배포를 통해 적용됩니다
- 개발 중 스키마 변경이 필요한 경우, 변경 후 Vercel에 배포하여 마이그레이션을 실행하세요
