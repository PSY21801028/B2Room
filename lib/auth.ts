import { supabase } from '@/utils/supabase/client'
import { createClient } from '@/utils/supabase/server'
import type { User, AuthError, Session } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  error: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

// 회원가입
export const signUp = async ({ email, password, fullName }: SignUpData): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    return {
      user: data.user,
      error,
    }
  } catch (error) {
    return {
      user: null,
      error: error as AuthError,
    }
  }
}

// 로그인
export const signIn = async ({ email, password }: SignInData): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return {
      user: data.user,
      error,
    }
  } catch (error) {
    return {
      user: null,
      error: error as AuthError,
    }
  }
}

// 로그아웃
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// 현재 사용자 가져오기
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// 현재 세션 가져오기
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting current session:', error)
    return null
  }
}

// 비밀번호 재설정 이메일 발송
export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// 비밀번호 업데이트
export const updatePassword = async (password: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// 사용자 정보 업데이트
export const updateUserProfile = async (updates: {
  fullName?: string
  avatarUrl?: string
}): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: updates.fullName,
        avatar_url: updates.avatarUrl,
      },
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// 인증 상태 변화 리스너
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentSession,
  resetPassword,
  updatePassword,
  updateUserProfile,
  onAuthStateChange,
}
