"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { createClient } from '../utils/supabase/client'
import { toast } from 'sonner'

interface TableInfo {
  name: string
  exists: boolean
  recordCount?: number
  columns?: string[]
  error?: string
}

const SupabaseTestButton = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<TableInfo[]>([])

  const testSupabaseConnection = async () => {
    setIsLoading(true)
    toast.info('📡 Supabase 연결 테스트 시작...')

    const tablesToTest = ['profiles', 'rooms', 'bookings', 'reviews', 'users', 'posts']
    const results: TableInfo[] = []

    try {
      const supabase = createClient()
      // 연결 상태 확인
      toast.loading('🔍 테이블 목록 조회 중...')

      for (const tableName of tablesToTest) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(5)

          if (!error && data) {
            results.push({
              name: tableName,
              exists: true,
              recordCount: data.length,
              columns: data.length > 0 ? Object.keys(data[0]) : []
            })
            
            toast.success(`✅ ${tableName}: ${data.length}개 레코드`)
          } else {
            results.push({
              name: tableName,
              exists: false,
              error: error?.message || 'Unknown error'
            })
          }
        } catch (err) {
          results.push({
            name: tableName,
            exists: false,
            error: err instanceof Error ? err.message : 'Connection failed'
          })
        }
      }

      setLastResult(results)

      // 결과 요약
      const existingTables = results.filter(r => r.exists)
      const totalRecords = existingTables.reduce((sum, table) => sum + (table.recordCount || 0), 0)

      if (existingTables.length > 0) {
        toast.success(`🎉 ${existingTables.length}개 테이블 발견! 총 ${totalRecords}개 레코드`)
      } else {
        toast.warning('⚠️ 사용 가능한 테이블이 없습니다. SQL 스크립트를 실행해주세요.')
      }

    } catch (error) {
      toast.error(`❌ 연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Supabase test error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testAuthSystem = async () => {
    try {
      const supabase = createClient()
      toast.info('🔐 Auth 시스템 테스트 중...')
      
      const { data: session, error } = await supabase.auth.getSession()
      
      if (error) {
        toast.error(`❌ Auth 오류: ${error.message}`)
      } else {
        toast.success(`✅ Auth 시스템 정상 (${session?.session ? '로그인됨' : '로그아웃됨'})`)
      }
    } catch (error) {
      toast.error(`❌ Auth 테스트 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">🧪 Supabase 연결 테스트</h2>
      
      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={testSupabaseConnection}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? '🔄 테스트 중...' : '📊 테이블 조회 테스트'}
        </Button>
        
        <Button 
          onClick={testAuthSystem}
          variant="outline"
          className="border-green-500 text-green-600 hover:bg-green-50"
        >
          🔐 Auth 시스템 테스트
        </Button>
      </div>

      {lastResult.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">📋 마지막 테스트 결과:</h3>
          <div className="grid gap-2">
            {lastResult.map((table) => (
              <div 
                key={table.name}
                className={`p-3 rounded border-l-4 ${
                  table.exists 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {table.exists ? '✅' : '❌'} {table.name}
                  </span>
                  {table.exists && (
                    <span className="text-sm text-gray-600">
                      {table.recordCount}개 레코드
                    </span>
                  )}
                </div>
                
                {table.exists && table.columns && table.columns.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    컬럼: {table.columns.join(', ')}
                  </div>
                )}
                
                {!table.exists && table.error && (
                  <div className="text-xs text-red-600 mt-1">
                    오류: {table.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SupabaseTestButton
