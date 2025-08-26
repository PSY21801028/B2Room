// Supabase 데이터베이스 타입 정의
// supabase gen types typescript --project-id YOUR_PROJECT_ID 명령어로 자동 생성할 수 있습니다.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      furniture_categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      furniture_items: {
        Row: {
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
        Insert: {
          id?: string
          category_id: number
          product_name: string
          brand?: string | null
          price?: number | null
          url?: string | null
          image_url?: string | null
          size?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: number
          product_name?: string
          brand?: string | null
          price?: number | null
          url?: string | null
          image_url?: string | null
          size?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "furniture_items_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "furniture_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      furniture_attributes: {
        Row: {
          id: number
          furniture_id: string // uuid
          mood_keywords: string[] | null
          colors: string[] | null
          materials: string[] | null
          forms: string[] | null
          patterns: string[] | null
          created_at: string
        }
        Insert: {
          id?: number
          furniture_id: string
          mood_keywords?: string[] | null
          colors?: string[] | null
          materials?: string[] | null
          forms?: string[] | null
          patterns?: string[] | null
          created_at?: string
        }
        Update: {
          id?: number
          furniture_id?: string
          mood_keywords?: string[] | null
          colors?: string[] | null
          materials?: string[] | null
          forms?: string[] | null
          patterns?: string[] | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "furniture_attributes_furniture_id_fkey"
            columns: ["furniture_id"]
            referencedRelation: "furniture_items"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 편의를 위한 타입 별칭들
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// 추가 타입 정의
export type FurnitureCategory = Tables<'furniture_categories'>
export type FurnitureItem = Tables<'furniture_items'>
export type FurnitureAttributes = Tables<'furniture_attributes'>

// 조인된 가구 데이터 타입
export interface FurnitureWithCategory extends FurnitureItem {
  category: FurnitureCategory
  attributes?: FurnitureAttributes
}

// 스타일 필터 타입
export type StyleFilter = 'modern' | 'minimal' | 'natural' | 'vintage' | 'nordic' | 'classic'

// AI 추천 파라미터 타입
export interface RecommendationParams {
  style: StyleFilter
  spaceType: string
  colorPreference?: string[]
  priceRange?: {
    min: number
    max: number
  }
  limit?: number
}