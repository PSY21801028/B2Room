# AI 인테리어 디자인 웹앱 설정 가이드

## 🔧 Supabase 데이터베이스 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요 (서버 변수를 권장합니다):

```env
# Supabase (서버 사이드 권장)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase (클라이언트 사이드 필요 시)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

변경 후 `npm run dev`를 다시 시작하세요.

### 2. 데이터베이스 테이블 생성

Supabase 프로젝트의 SQL Editor에서 다음 SQL 파일들을 순서대로 실행하세요:

1. **기본 테이블 생성**: `simple-tables.sql`
2. **가구 테이블 생성**: `furniture-tables.sql`

### 3. 가구 데이터 확인

SQL 실행 후 다음 쿼리로 데이터가 제대로 삽입되었는지 확인하세요:

```sql
-- 가구 카테고리 확인
SELECT * FROM furniture_categories;

-- 가구 아이템 확인
SELECT * FROM furniture_items;

-- 조인된 가구 데이터 확인
SELECT 
  fi.*,
  fc.name as category_name
FROM furniture_items fi
JOIN furniture_categories fc ON fi.category_id = fc.id
LIMIT 10;
```

## 🎯 기능 테스트

### 1. DB 연결 테스트
- 환경 변수 설정 후 개발 서버 재시작
- 디버그 페이지(`/debug/supabase`)로 이동하여 연결/데이터 확인
- 또는 결과 페이지(`/result`)에서 실제 DB 기반 로드 확인

### 2. 폴백 모드
- 환경 변수가 없거나 DB 연결에 실패하면 자동으로 목업 데이터 사용
- "DB 연결에 실패했습니다. 목업 데이터를 사용합니다." 메시지 표시

## 🔍 DB 스키마 구조

### furniture_categories
- 가구 카테고리 (소파, 테이블, 침대, 수납가구, 조명, 장식소품)

### furniture_items
- 가구 제품 정보 (이름, 브랜드, 가격, URL, 이미지, 크기, 설명)
- 스타일 태그, 컬러 태그, 재질 태그

### furniture_attributes
- AI 분석용 속성 (분위기 키워드, 색상, 재질, 형태, 패턴)

## 🚀 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 의존성 설치
npm install

# 빌드
npm run build
```

## 📋 추가 설정 사항

1. **Supabase RLS (Row Level Security)**: 현재 개발 모드에서는 비활성화
2. **이미지 저장소**: 현재는 Unsplash 플레이스홀더 사용
3. **결제 시스템**: 향후 구현 예정

## ⚠️ 주의사항

- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- Supabase API 키는 공개되어도 안전한 anon key만 사용하세요
- 프로덕션 배포 시에는 RLS 정책을 활성화하세요

