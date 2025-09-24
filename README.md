# Skin AI App

피부 분석 및 관리를 위한 Next.js 애플리케이션입니다.

## 기능

- 🔐 Google OAuth 로그인/회원가입
- 📊 피부 분석 및 기록
- 📅 스킨케어 루틴 관리
- 🛍️ 제품 추천
- ⚙️ 개인 설정 관리

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM
- **Styling**: CSS Modules
- **Deployment**: Vercel

## 로컬 개발 환경 설정

1. 저장소 클론
```bash
git clone <repository-url>
cd skin-ai-app
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="file:./dev.db"
```

4. 데이터베이스 설정
```bash
npx prisma migrate dev
npx prisma generate
```

5. 개발 서버 실행
```bash
npm run dev
```

## 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `NEXTAUTH_URL`: 배포된 도메인 URL
   - `NEXTAUTH_SECRET`: 랜덤 시크릿 키
   - `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿
   - `DATABASE_URL`: 프로덕션 데이터베이스 URL

4. 자동 배포 완료

## Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services > Credentials로 이동
4. OAuth 2.0 Client ID 생성
5. 승인된 리디렉션 URI 추가:
   - 로컬: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://your-domain.vercel.app/api/auth/callback/google`

## 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run test`: 테스트 실행
- `npm run migrate:deploy`: 프로덕션 마이그레이션

## 라이선스

MIT License
