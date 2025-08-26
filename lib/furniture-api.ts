import { supabase } from '@/utils/supabase/client'

// 가구 데이터 타입 정의 (실제 DB 스키마에 맞춤)
export interface FurnitureItem {
  id: string // uuid
  category_id: number
  product_name: string
  brand: string | null
  price: number | null
  url: string | null
  image_url: string | null
  size: string | null
  created_at: string
}

export interface FurnitureCategory {
  id: number
  name: string
}

export interface FurnitureAttributes {
  id: number
  furniture_id: string // uuid
  mood_keywords: string[] | null
  colors: string[] | null
  materials: string[] | null
  forms: string[] | null
  patterns: string[] | null
  created_at: string
}

export interface FurnitureWithCategory extends FurnitureItem {
  category?: FurnitureCategory
  attributes?: FurnitureAttributes
}

/**
 * 모든 가구 조회 (간단한 버전)
 */
export async function getAllFurniture(): Promise<FurnitureWithCategory[]> {
  try {
    const { data, error } = await supabase
      .from('furniture_items')
      .select(`
        *,
        category:furniture_categories(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('가구 데이터 조회 오류:', error)
      return getMockFurniture()
    }
    
    return data as FurnitureWithCategory[] || []
  } catch (error) {
    console.error('Supabase 연결 오류:', error)
    return getMockFurniture()
  }
}

/**
 * 스타일별 가구 추천 (attributes 테이블의 mood_keywords 사용)
 */
export async function getRecommendedFurniture(style: string, limit: number = 6): Promise<FurnitureWithCategory[]> {
  try {
    const { data, error } = await supabase
      .from('furniture_items')
      .select(`
        *,
        category:furniture_categories(*),
        attributes:furniture_attributes(*)
      `)
      .limit(limit)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('추천 가구 조회 오류:', error)
      return getMockFurniture().slice(0, limit)
    }
    
    // mood_keywords에 style이 포함된 가구만 필터링
    const filteredData = data?.filter((item: any) => {
      const attributes = item.attributes
      if (!attributes || !attributes.mood_keywords) return false
      return attributes.mood_keywords.some((keyword: any) => 
        keyword.toLowerCase().includes(style.toLowerCase())
      )
    }) || []
    
    return filteredData.slice(0, limit) as FurnitureWithCategory[]
  } catch (error) {
    console.error('Supabase 연결 오류:', error)
    return getMockFurniture().slice(0, limit)
  }
}

/**
 * AI 분석 결과 기반 추천 (attributes 테이블의 mood_keywords 사용)
 */
export async function getAIRecommendations(): Promise<FurnitureWithCategory[]> {
  try {
    // 모던, 미니멀 스타일의 가구 추천
    const { data, error } = await supabase
      .from('furniture_items')
      .select(`
        *,
        category:furniture_categories(*),
        attributes:furniture_attributes(*)
      `)
      .limit(6)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('AI 추천 가구 조회 오류:', error)
      return getMockFurniture()
    }
    
    // mood_keywords에 모던/미니멀 관련 키워드가 포함된 가구만 필터링
    const filteredData = data?.filter((item: any) => {
      const attributes = item.attributes
      if (!attributes || !attributes.mood_keywords) return false
      return attributes.mood_keywords.some((keyword: any) => 
        ['모던', '미니멀', '심플', '클린'].some(style => 
          keyword.toLowerCase().includes(style.toLowerCase())
        )
      )
    }) || []
    
    return filteredData as FurnitureWithCategory[]
  } catch (error) {
    console.error('Supabase 연결 오류:', error)
    return getMockFurniture()
  }
}

/**
 * 연결 테스트 함수
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    // 테이블 존재 여부 확인
    const { data, error, count } = await supabase
      .from('furniture_items')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      return {
        success: false,
        message: `데이터베이스 오류: ${error.message}`
      }
    }
    
    return {
      success: true,
      message: `연결 성공! ${count || 0}개의 가구 데이터가 있습니다.`,
      count: count || 0
    }
  } catch (error) {
    return {
      success: false,
      message: `연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

/**
 * 가격 포맷팅
 */
export function formatPrice(price: number | null): string {
  if (!price) return '가격 문의'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

/**
 * 목업 데이터 (환경 변수 없거나 DB 연결 실패 시 사용)
 */
export function getMockFurniture(): FurnitureWithCategory[] {
  return [
    {
      id: '1',
      category_id: 1,
      product_name: '모던 3인용 소파',
      brand: '이케아',
      price: 299000,
      url: 'https://www.ikea.com/kr/ko/',
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      size: '180 x 88 x 66 cm',
      created_at: new Date().toISOString(),
      category: {
        id: 1,
        name: '소파'
      }
    },
    {
      id: '2',
      category_id: 2,
      product_name: '원목 커피테이블',
      brand: '한샘',
      price: 149000,
      url: 'https://www.hanssem.com',
      image_url: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400',
      size: '120 x 60 x 45 cm',
      created_at: new Date().toISOString(),
      category: {
        id: 2,
        name: '테이블'
      }
    },
    {
      id: '3',
      category_id: 5,
      product_name: '북유럽 스타일 플로어 스탠드',
      brand: '일룸',
      price: 129000,
      url: 'https://www.iloom.co.kr',
      image_url: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400',
      size: '높이 150 cm',
      created_at: new Date().toISOString(),
      category: {
        id: 5,
        name: '조명'
      }
    }
  ]
}