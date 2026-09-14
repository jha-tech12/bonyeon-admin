# BONYEON Admin — 문의 관리자 페이지

BONYEON 랜딩페이지 문의 접수(Google Sheets)를 관리하는 별도 관리자 웹앱입니다.

## 기능

- 문의 내역 목록 조회 (최신순)
- 처리 상태 변경 (H열: 접수 / 확인 / 완료)
- 비고 메모 저장 (I열)
- 상태별 필터
- 관리자 비밀번호 로그인

## 사전 준비 (필수)

랜딩페이지와 **동일한 Google Sheets**를 사용합니다.  
관리 기능을 쓰려면 Apps Script를 업데이트해야 합니다.

→ [`scripts/google-apps-script/README.md`](scripts/google-apps-script/README.md) 참고

1. `Code.gs` 코드 교체 및 재배포
2. Script Properties에 `ADMIN_API_KEY` 설정
3. `.env`에 동일한 키 입력

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
| `GOOGLE_SCRIPT_URL` | GAS Web App URL |
| `ADMIN_API_KEY` | GAS Script Properties와 동일 |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호 |
| `ADMIN_SESSION_SECRET` | 세션 서명용 랜덤 문자열 |

## 시트 컬럼

| 열 | 항목 |
|---|---|
| H | 처리 상태 (관리자 수정) |
| I | 비고 (관리자 메모) |

> F열은 **문의사항**입니다. 처리 상태는 **H열**입니다.
