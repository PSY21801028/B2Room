"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { createClient } from '../utils/supabase/client'
import { toast } from 'sonner'

const DataInsertButton = () => {
  const [isLoading, setIsLoading] = useState(false)

  // 샘플 데이터
  const sampleProfiles = [
    {
      id: 'user1-uuid-placeholder',
      username: 'john_host',
      full_name: '김영수',
      avatar_url: 'https://example.com/avatar1.jpg'
    },
    {
      id: 'user2-uuid-placeholder', 
      username: 'sarah_traveler',
      full_name: '이지은',
      avatar_url: 'https://example.com/avatar2.jpg'
    }
  ]

  const sampleRooms = [
    {
      title: '강남역 근처 아늑한 스튜디오',
      description: '지하철역 도보 3분, 깔끔하고 현대적인 인테리어의 원룸입니다. 비즈니스 출장이나 여행객에게 완벽한 공간입니다.',
      price_per_night: 65000,
      max_guests: 2,
      amenities: ['WiFi', '에어컨', '세탁기', '주방시설', '주차가능'],
      image_urls: ['https://example.com/room1-1.jpg', 'https://example.com/room1-2.jpg'],
      host_id: 'user1-uuid-placeholder'
    },
    {
      title: '홍대 감성 복층 아파트',
      description: '홍대 핫플레이스 도보권! 감각적인 인테리어와 복층 구조로 넓은 공간을 자랑합니다. 파티나 모임에 완벽합니다.',
      price_per_night: 120000,
      max_guests: 6,
      amenities: ['WiFi', '에어컨', '난방', '세탁기', '건조기', '주방시설', 'TV', '음향시설'],
      image_urls: ['https://example.com/room2-1.jpg', 'https://example.com/room2-2.jpg', 'https://example.com/room2-3.jpg'],
      host_id: 'user1-uuid-placeholder'
    },
    {
      title: '제주도 바다뷰 펜션',
      description: '제주 서쪽 해안가에 위치한 바다뷰 펜션입니다. 일몰이 아름다운 곳으로 커플이나 가족 여행객에게 인기가 많습니다.',
      price_per_night: 180000,
      max_guests: 4,
      amenities: ['WiFi', '에어컨', '바다뷰', '바베큐시설', '주차가능', '조식제공'],
      image_urls: ['https://example.com/room3-1.jpg', 'https://example.com/room3-2.jpg'],
      host_id: 'user2-uuid-placeholder'
    }
  ]

  const checkTablesExist = async () => {
    try {
      const supabase = createClient()
      
      // 먼저 테이블 존재 여부 확인
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (profilesError?.code === 'PGRST205' || profilesError?.message?.includes('Could not find the table')) {
        toast.error('❌ 테이블이 없습니다!')
        toast.info('💡 먼저 Supabase 콘솔에서 테이블을 생성해주세요.')
        toast.info('📋 simple-tables.sql 또는 create-tables.sql을 실행하세요.')
        return false
      } else if (profilesError) {
        toast.error(`❌ 테이블 확인 오류: ${profilesError.message}`)
        console.error('Table check error:', profilesError)
        return false
      } else {
        toast.success('✅ 테이블이 존재합니다!')
        return true
      }
    } catch (error) {
      toast.error(`❌ 테이블 확인 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Table check exception:', error)
      return false
    }
  }

  const insertSampleData = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    toast.info('📊 샘플 데이터 삽입 시작...')

    try {
      const supabase = createClient()

      // 1. 먼저 테이블 확인
      const tablesExist = await checkTablesExist()
      if (!tablesExist) return

      // 2. 프로필 데이터 삽입
      toast.loading('👥 프로필 데이터 삽입 중...')
      
      // UUID 없이 삽입 (테이블에서 자동 생성)
      const profilesWithoutIds = sampleProfiles.map(profile => ({
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      }))

      const { data: profilesResult, error: profilesError } = await supabase
        .from('profiles')
        .insert(profilesWithoutIds)
        .select()

      if (profilesError) {
        toast.error(`❌ 프로필 삽입 실패: ${profilesError.message || '알 수 없는 오류'}`)
        console.error('Profiles error details:', {
          message: profilesError.message,
          details: profilesError.details,
          hint: profilesError.hint,
          code: profilesError.code
        })
        return
      }

      toast.success(`✅ ${profilesResult?.length || 0}개 프로필 삽입 완료`)

      // 3. 방 데이터 삽입
      toast.loading('🏠 방 데이터 삽입 중...')
      
      const roomsWithRealHostIds = sampleRooms.map((room, index) => ({
        ...room,
        host_id: profilesResult[index < 2 ? 0 : 1].id // 첫 두 방은 첫 번째 사용자, 나머지는 두 번째 사용자
      }))

      const { data: roomsResult, error: roomsError } = await supabase
        .from('rooms')
        .insert(roomsWithRealHostIds)
        .select()

      if (roomsError) {
        toast.error(`❌ 방 삽입 실패: ${roomsError.message}`)
        console.error('Rooms error:', roomsError)
        return
      }

      toast.success(`✅ ${roomsResult?.length || 0}개 방 데이터 삽입 완료`)

      // 4. 최종 성공 메시지
      toast.success('🎉 모든 샘플 데이터 삽입 완료!')
      
      // 삽입된 데이터 요약 표시
      setTimeout(() => {
        toast.info(`📊 총 ${profilesResult?.length || 0}개 프로필, ${roomsResult?.length || 0}개 방이 생성되었습니다.`)
      }, 1000)

    } catch (error) {
      toast.error(`❌ 데이터 삽입 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Insert data error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkCurrentData = async () => {
    setIsLoading(true)
    toast.info('🔍 현재 데이터 확인 중...')

    try {
      const supabase = createClient()
      
      const tables = ['profiles', 'rooms', 'bookings', 'reviews']
      let totalRecords = 0

      for (const tableName of tables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(10)

          if (!error && data) {
            totalRecords += data.length
            if (data.length > 0) {
              toast.success(`✅ ${tableName}: ${data.length}개 레코드`)
            } else {
              toast.info(`📝 ${tableName}: 비어있음`)
            }
          } else {
            toast.error(`❌ ${tableName}: ${error?.message || '오류'}`)
          }
        } catch (e) {
          toast.error(`❌ ${tableName}: 접근 불가`)
        }
      }

      if (totalRecords > 0) {
        toast.success(`🎯 총 ${totalRecords}개의 레코드가 존재합니다!`)
      } else {
        toast.warning('⚠️ 데이터가 없습니다. 샘플 데이터를 삽입해보세요.')
      }

    } catch (error) {
      toast.error(`❌ 데이터 확인 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">🗃️ 데이터베이스 관리</h2>
      
      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={checkCurrentData}
          disabled={isLoading}
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          {isLoading ? '🔄 확인 중...' : '🔍 현재 데이터 확인'}
        </Button>
        
        <Button 
          onClick={insertSampleData}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? '🔄 삽입 중...' : '📊 샘플 데이터 삽입'}
        </Button>
      </div>

      <div className="bg-white p-4 rounded border-l-4 border-blue-500">
        <h3 className="font-semibold text-gray-700 mb-2">삽입할 샘플 데이터:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>프로필 2개:</strong> 김영수(호스트), 이지은(여행객)</li>
          <li>• <strong>방 3개:</strong> 강남 스튜디오, 홍대 복층, 제주 바다뷰</li>
          <li>• <strong>특징:</strong> 실제 한국 지역 기반, 현실적인 가격대</li>
        </ul>
      </div>

      <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
        <h4 className="font-semibold text-yellow-800 mb-2">🏗️ 테이블 생성이 필요해요!</h4>
        <div className="text-sm text-yellow-800 space-y-2">
          <p><strong>1단계:</strong> <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase 대시보드</a> 접속</p>
          <p><strong>2단계:</strong> 프로젝트 선택 → SQL Editor 메뉴 클릭</p>
          <p><strong>3단계:</strong> 다음 중 하나를 복사하여 실행:</p>
          <div className="ml-4 space-y-1">
            <p>• <code className="bg-yellow-100 px-1 rounded">simple-tables.sql</code> (빠른 테스트용)</p>
            <p>• <code className="bg-yellow-100 px-1 rounded">create-tables.sql</code> (완전한 버전)</p>
          </div>
          <p><strong>4단계:</strong> 실행 후 이 페이지에서 "현재 데이터 확인" 버튼 클릭</p>
        </div>
      </div>
    </div>
  )
}

export default DataInsertButton
