"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { toast } from 'sonner'

const TableCreationGuide = () => {
  const [showSQL, setShowSQL] = useState(false)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`✅ ${type} SQL이 클립보드에 복사되었습니다!`)
    }).catch(() => {
      toast.error('❌ 복사 실패')
    })
  }

  const simpleSQL = `-- 간단한 테이블 생성 (테스트용)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_guests INTEGER NOT NULL DEFAULT 1,
    amenities TEXT[],
    image_urls TEXT[],
    host_id UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 비활성화 (테스트용)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;`

  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">🏗️ 테이블 생성 가이드</h2>
      
      <div className="bg-white p-4 rounded-lg border border-amber-200">
        <h3 className="font-semibold text-gray-700 mb-3">📋 단계별 가이드</h3>
        <ol className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
            <span><a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Supabase 대시보드</a> 접속</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
            <span>프로젝트 선택 (<code className="bg-gray-100 px-1 rounded text-xs">gfcemkavodgaglfbulmn</code>)</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
            <span>좌측 메뉴에서 <strong>"SQL Editor"</strong> 클릭</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
            <span>아래 SQL을 복사하여 실행</span>
          </li>
        </ol>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={() => setShowSQL(!showSQL)}
          variant="outline"
          className="border-amber-500 text-amber-700 hover:bg-amber-50"
        >
          {showSQL ? '📄 SQL 숨기기' : '📄 SQL 보기'}
        </Button>
        
        {showSQL && (
          <Button 
            onClick={() => copyToClipboard(simpleSQL, '간단한 테이블')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            📋 SQL 복사하기
          </Button>
        )}
      </div>

      {showSQL && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
          <pre className="text-xs whitespace-pre-wrap">{simpleSQL}</pre>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
        <h4 className="font-semibold text-blue-800 mb-2">🎯 다음 단계</h4>
        <p className="text-sm text-blue-700">
          SQL 실행 후 위의 <strong>"현재 데이터 확인"</strong> 버튼을 클릭하여 테이블이 생성되었는지 확인하세요.
          그 다음 <strong>"샘플 데이터 삽입"</strong> 버튼으로 데이터를 추가할 수 있습니다.
        </p>
      </div>
    </div>
  )
}

export default TableCreationGuide
