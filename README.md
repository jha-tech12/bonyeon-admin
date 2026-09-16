# BONYEON Admin — 문의 관리자 페이지

BONYEON 랜딩페이지 문의 접수를 관리하는 별도 관리자 웹앱입니다.

## 기능

- 문의 내역 목록 조회 (최신순)
- 처리 상태 변경 (접수 / 확인 / 완료)
- 비고 메모 저장
- 상태별 필터
- Supabase Auth 이메일/비밀번호 로그인

## 사전 준비 (필수)

### 1. Supabase 관리자 계정

공개 회원가입은 사용하지 않습니다. 대시보드에서 관리자만 만듭니다.

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트
2. **Authentication → Users → Add user**
3. 이메일/비밀번호 입력, **Auto Confirm User** 체크 후 생성
4. **Authentication → Providers → Email**에서 **Allow new users to sign up** 을 끄면 외부 가입을 막을 수 있습니다

### 2. 환경 변수와 테이블

**Project Settings → API**에서 Project URL, publishable(anon) key, service_role key를 `.env.local`에 넣습니다.

대시보드 **SQL Editor**에서 아래 파일을 실행해 `inquiries` 테이블을 만듭니다.

- 파일: 저장소 루트 [`supabase/schema.sql`](../supabase/schema.sql)
- 주소: https://supabase.com/dashboard/project/hefgtqpkwzjpyakjlsuf/sql/new
- 내용을 붙여 넣고 **Run**

## 로컬 실행

```bash
cp .env.example .env.local
# .env.local 값 입력 후
npm install
npm run dev
```

- 로그인: http://localhost:3000/login
- 대시보드: http://localhost:3000/dashboard

## 환경 변수

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable 또는 anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 service_role 키 |

## 기존 Google Sheets 데이터 가져오기

문의접수 탭을 CSV로 저장한 뒤:

```bash
npx tsx scripts/import-inquiries.ts ./inquiries.csv
```
