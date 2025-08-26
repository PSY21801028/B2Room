# 환경변수 설정 가이드

`.env.local` 파일에 다음 환경변수들을 설정해주세요:

```env
# FastAPI 서버 설정 (필수)
FASTAPI_SERVER_URL=http://141.223.108.122:8000

# FastAPI 서버 인증 정보 (선택사항)
FASTAPI_USERNAME=admin
FASTAPI_PASSWORD=your_password

# Next.js 환경 설정
NODE_ENV=development
```

## 설정 설명

### FASTAPI_SERVER_URL (필수)
- AI 분석을 수행하는 FastAPI 서버의 주소
- 예시: `http://141.223.108.122:8000`
- 로컬 테스트 시: `http://localhost:8000`

### FASTAPI_USERNAME, FASTAPI_PASSWORD (선택)
- Basic Authentication을 사용하는 경우 설정
- 설정하지 않으면 인증 없이 요청

### NODE_ENV
- 개발 환경: `development` (상세한 오류 정보 표시)
- 운영 환경: `production` (보안을 위해 오류 정보 제한)

## 보안 주의사항

1. `.env.local` 파일은 절대 Git에 커밋하지 마세요
2. 운영 환경에서는 환경변수를 안전하게 관리하세요
3. API 키나 비밀번호는 별도의 보안 저장소를 사용하세요

