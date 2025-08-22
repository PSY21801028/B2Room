# Supabase 설정 가이드

이 프로젝트에서 Supabase와 Next.js를 연동하는 방법을 설명합니다.

## 환경변수 설정

`.env.local` 파일이 이미 설정되어 있습니다:
```
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY2Vta2F2b2RnYWdsZmJ1bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDAzMjAsImV4cCI6MjA3MTQxNjMyMH0.6hVjFyoVmRxJxgbd97yISJxxsp7kzOWVTR7fxLnpMVY
```

Supabase URL: `https://gfcemkavodgaglfbulmn.supabase.co`

## 파일 구조

```
lib/
├── supabase.ts          # Supabase 클라이언트 설정
├── database.types.ts    # 데이터베이스 타입 정의
├── auth.ts             # 인증 관련 유틸리티 함수
└── README.md           # 이 파일
```

## 사용 예시

### 1. 회원가입

```typescript
import { signUp } from '@/lib/auth'

const handleSignUp = async () => {
  const { user, error } = await signUp({
    email: 'user@example.com',
    password: 'password123',
    fullName: '홍길동'
  })

  if (error) {
    console.error('회원가입 실패:', error.message)
  } else {
    console.log('회원가입 성공:', user)
  }
}
```

### 2. 로그인

```typescript
import { signIn } from '@/lib/auth'

const handleSignIn = async () => {
  const { user, error } = await signIn({
    email: 'user@example.com',
    password: 'password123'
  })

  if (error) {
    console.error('로그인 실패:', error.message)
  } else {
    console.log('로그인 성공:', user)
  }
}
```

### 3. 로그아웃

```typescript
import { signOut } from '@/lib/auth'

const handleSignOut = async () => {
  const { error } = await signOut()
  
  if (error) {
    console.error('로그아웃 실패:', error.message)
  } else {
    console.log('로그아웃 성공')
  }
}
```

### 4. 현재 사용자 정보 가져오기

```typescript
import { getCurrentUser } from '@/lib/auth'

const user = await getCurrentUser()
if (user) {
  console.log('현재 사용자:', user)
} else {
  console.log('로그인되지 않음')
}
```

### 5. 인증 상태 변화 리스너

```typescript
import { onAuthStateChange } from '@/lib/auth'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('인증 상태 변화:', event, session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <div>My App</div>
}
```

### 6. 데이터베이스 조작

```typescript
import supabase from '@/lib/supabase'

// 데이터 조회
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)

// 데이터 삽입
const { data, error } = await supabase
  .from('users')
  .insert({
    email: 'user@example.com',
    full_name: '홍길동'
  })

// 데이터 업데이트
const { data, error } = await supabase
  .from('users')
  .update({ full_name: '새로운 이름' })
  .eq('id', userId)

// 데이터 삭제
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId)
```

## 타입 생성

실제 데이터베이스 스키마에 맞는 타입을 자동 생성하려면:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

## 보안 주의사항

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용하세요
- 클라이언트 사이드에서는 `NEXT_PUBLIC_` 접두사가 붙은 환경변수만 사용 가능합니다
- Row Level Security (RLS) 정책을 설정하여 데이터 보안을 강화하세요
