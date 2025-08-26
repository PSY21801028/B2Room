"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SupabaseDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [furnitureData, setFurnitureData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [attributesData, setAttributesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 연결 테스트
  const testConnection = async () => {
    try {
      setIsLoading(true);
      setConnectionStatus("연결 테스트 중...");
      
      const { data, error, count } = await supabase
        .from('furniture_items')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        setConnectionStatus(`❌ 연결 실패: ${error.message}`);
        toast.error(`연결 실패: ${error.message}`);
      } else {
        setConnectionStatus(`✅ 연결 성공! ${count || 0}개의 가구 데이터가 있습니다.`);
        toast.success(`연결 성공! ${count || 0}개의 가구 데이터가 있습니다.`);
      }
    } catch (error) {
      setConnectionStatus(`❌ 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      toast.error(`오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 가구 데이터 로드
  const loadFurnitureData = async () => {
    try {
      setIsLoading(true);
      toast.info("가구 데이터를 불러오고 있습니다...");
      
      const { data, error } = await supabase
        .from('furniture_items')
        .select(`
          *,
          category:furniture_categories(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(`가구 데이터 로드 실패: ${error.message}`);
      } else {
        setFurnitureData(data || []);
        toast.success(`${data?.length || 0}개의 가구 데이터를 불러왔습니다.`);
      }
    } catch (error) {
      toast.error(`오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 데이터 로드
  const loadCategoriesData = async () => {
    try {
      setIsLoading(true);
      toast.info("카테고리 데이터를 불러오고 있습니다...");
      
      const { data, error } = await supabase
        .from('furniture_categories')
        .select('*')
        .order('id');
      
      if (error) {
        toast.error(`카테고리 데이터 로드 실패: ${error.message}`);
      } else {
        setCategoriesData(data || []);
        toast.success(`${data?.length || 0}개의 카테고리 데이터를 불러왔습니다.`);
      }
    } catch (error) {
      toast.error(`오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 속성 데이터 로드
  const loadAttributesData = async () => {
    try {
      setIsLoading(true);
      toast.info("속성 데이터를 불러오고 있습니다...");
      
      const { data, error } = await supabase
        .from('furniture_attributes')
        .select(`
          *,
          furniture:furniture_items(product_name)
        `)
        .order('id');
      
      if (error) {
        toast.error(`속성 데이터 로드 실패: ${error.message}`);
      } else {
        setAttributesData(data || []);
        toast.success(`${data?.length || 0}개의 속성 데이터를 불러왔습니다.`);
      }
    } catch (error) {
      toast.error(`오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#33271e] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#f5f0eb] text-center">
          🗄️ Supabase DB 연결 테스트
        </h1>
        
        {/* 연결 상태 */}
        <div className="bg-[#715845] rounded-lg p-4">
          <h2 className="text-xl font-semibold text-[#f5f0eb] mb-2">연결 상태</h2>
          <p className="text-[#e9e1d8]">{connectionStatus || "아직 테스트하지 않음"}</p>
        </div>

        {/* 테스트 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={testConnection}
            disabled={isLoading}
            className="bg-[#8d7057] hover:bg-[#a7896d] text-[#f5f0eb]"
          >
            🔌 연결 테스트
          </Button>
          
          <Button
            onClick={loadFurnitureData}
            disabled={isLoading}
            className="bg-[#8d7057] hover:bg-[#a7896d] text-[#f5f0eb]"
          >
            🪑 가구 데이터 로드
          </Button>
          
          <Button
            onClick={loadCategoriesData}
            disabled={isLoading}
            className="bg-[#8d7057] hover:bg-[#a7896d] text-[#f5f0eb]"
          >
            📂 카테고리 데이터 로드
          </Button>
        </div>

        {/* 가구 데이터 표시 */}
        {furnitureData.length > 0 && (
          <div className="bg-[#715845] rounded-lg p-4">
            <h2 className="text-xl font-semibold text-[#f5f0eb] mb-4">
              🪑 가구 데이터 ({furnitureData.length}개)
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {furnitureData.map((item: any) => (
                <div key={item.id} className="bg-[#8d7057] rounded-lg p-3">
                  <p className="font-medium text-[#f5f0eb]">{item.product_name}</p>
                  <p className="text-sm text-[#e9e1d8]">
                    {item.brand} - {item.price?.toLocaleString()}원
                  </p>
                  <p className="text-xs text-[#d4c4b8]">
                    카테고리: {item.category?.name} | 크기: {item.size}
                  </p>
                  <p className="text-xs text-[#d4c4b8]">ID: {item.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 카테고리 데이터 표시 */}
        {categoriesData.length > 0 && (
          <div className="bg-[#715845] rounded-lg p-4">
            <h2 className="text-xl font-semibold text-[#f5f0eb] mb-4">
              📂 카테고리 데이터 ({categoriesData.length}개)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categoriesData.map((category: any) => (
                <div key={category.id} className="bg-[#8d7057] rounded-lg p-3 text-center">
                  <p className="font-medium text-[#f5f0eb]">{category.name}</p>
                  <p className="text-xs text-[#d4c4b8]">ID: {category.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 속성 데이터 표시 */}
        {attributesData.length > 0 && (
          <div className="bg-[#715845] rounded-lg p-4">
            <h2 className="text-xl font-semibold text-[#f5f0eb] mb-4">
              🎨 속성 데이터 ({attributesData.length}개)
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attributesData.map((attr: any) => (
                <div key={attr.id} className="bg-[#8d7057] rounded-lg p-3">
                  <p className="font-medium text-[#f5f0eb]">
                    {attr.furniture?.product_name || '알 수 없는 가구'}
                  </p>
                  <p className="text-sm text-[#e9e1d8]">
                    분위기: {attr.mood_keywords?.join(', ') || '없음'}
                  </p>
                  <p className="text-xs text-[#d4c4b8]">
                    색상: {attr.colors?.join(', ') || '없음'} | 
                    재질: {attr.materials?.join(', ') || '없음'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 환경변수 확인 */}
        <div className="bg-[#715845] rounded-lg p-4">
          <h2 className="text-xl font-semibold text-[#f5f0eb] mb-4">🔧 환경변수 확인</h2>
          <div className="space-y-2 text-sm">
            <p className="text-[#e9e1d8]">
              <span className="font-medium">SUPABASE_URL:</span> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 설정되지 않음'}
            </p>
            <p className="text-[#e9e1d8]">
              <span className="font-medium">SUPABASE_KEY:</span> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 설정되지 않음'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


