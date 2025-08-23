"use client";

import { ArrowLeft, Home, Download, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { getAIRecommendations, formatPrice, testSupabaseConnection } from "@/lib/furniture-api";
import type { FurnitureWithCategory } from "@/lib/furniture-api";

export default function ResultPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [furnitureList, setFurnitureList] = useState<FurnitureWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  
  // 임시 결과 데이터
  const results = [
    {
      id: 1,
      title: "모던 미니멀 거실",
      description: "제거하고 싶은 가구 이미지에서 제거",
      features: ["깔끔한 라인", "중성 컬러", "기능적 배치"]
    },
    {
      id: 2,
      title: "추천 가구 삽입 이미지 생성",
      description: "AI가 추천하는 최적의 가구 배치",
      features: ["공간 최적화", "스타일 매칭", "실용성 고려"]
    }
  ];

  // 가구 데이터 로드
  useEffect(() => {
    const loadFurniture = async () => {
      try {
        setIsLoading(true);
        
        // 먼저 연결 테스트
        toast.info("Supabase 연결을 확인하고 있습니다...");
        const connectionTest = await testSupabaseConnection();
        
        if (connectionTest.success) {
          setConnectionStatus(`✅ ${connectionTest.message}`);
          toast.success(connectionTest.message);
          
          // 가구 데이터 로드
          toast.info("추천 가구를 불러오고 있습니다...");
          const furniture = await getAIRecommendations();
          
          if (furniture && furniture.length > 0) {
            setFurnitureList(furniture);
            toast.success(`${furniture.length}개의 추천 가구를 찾았습니다!`);
          } else {
            toast.warning("추천 가구가 없습니다.");
          }
        } else {
          setConnectionStatus(`❌ ${connectionTest.message}`);
          toast.error(connectionTest.message);
          toast.info("목업 데이터를 사용합니다.");
          
          // 목업 데이터 로드
          const { getMockFurniture } = await import("@/lib/furniture-api");
          setFurnitureList(getMockFurniture());
        }
        
      } catch (error) {
        console.error('가구 데이터 로드 실패:', error);
        setConnectionStatus("❌ 연결 실패");
        toast.error("데이터 로드에 실패했습니다. 목업 데이터를 사용합니다.");
        
        // 목업 데이터 로드
        const { getMockFurniture } = await import("@/lib/furniture-api");
        setFurnitureList(getMockFurniture());
      } finally {
        setIsLoading(false);
      }
    };

    loadFurniture();
  }, []);

  const handleImageGeneration = () => {
    toast.info("이미지를 생성하고 있습니다...");
    setTimeout(() => {
      toast.success("이미지 생성이 완료되었습니다!");
    }, 2000);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#33271e] mobile-container">
      {/* Header */}
      <header className="absolute top-0 z-20 w-full p-4">
        <div className="flex items-center justify-between">
          <Link href="/input">
            <Button
              variant="ghost"
              size="icon"
              className="flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-white">결과</h1>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col bg-[#5d4837] pt-20 pb-6">
        <div className="flex-1 px-6 space-y-6">
          {/* Connection Status */}
          <div className="bg-[#715845] rounded-lg p-3">
            <p className="text-sm text-[#f5f0eb]">{connectionStatus || "연결 상태 확인 중..."}</p>
          </div>

          {/* Result Header */}
          <div className="text-center">
            <Home className="w-16 h-16 mx-auto text-[#a7896d] mb-4" />
            <h2 className="text-xl font-semibold text-[#f5f0eb]">AI 인테리어 결과</h2>
          </div>

          {/* Image Generation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#e9e1d8]">4-1. 이미지 생성</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {results.map((result, index) => (
                <div 
                  key={result.id}
                  className={`bg-[#715845] rounded-lg p-4 border-2 transition-colors ${
                    selectedImage === index 
                      ? "border-[#b99e86]" 
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  {/* 이미지 플레이스홀더 */}
                  <div className="w-full h-32 bg-[#8d7057] rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-[#dcccbf] text-sm">이미지 생성 중...</span>
                  </div>
                  
                  <h4 className="font-semibold text-[#f5f0eb] mb-2">{result.title}</h4>
                  <p className="text-sm text-[#dcccbf] mb-3">{result.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {result.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-[#a7896d] text-xs text-white rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleImageGeneration}
              className="w-full bg-[#a7896d] hover:bg-[#b99e86] text-white py-3"
            >
              <Download className="w-4 h-4 mr-2" />
              새 이미지 생성하기
            </Button>
          </div>

          {/* Recommendation System */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#e9e1d8]">4-2. 추천 시스템</h3>
            <p className="text-sm text-[#dcccbf]">• 유사도 기반 가구 추천</p>
            <p className="text-sm text-[#dcccbf]">• 추천 가구 리스트 및 구매 url 제공</p>
            
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a7896d] mx-auto"></div>
                  <p className="text-[#dcccbf] mt-2">가구 데이터를 불러오는 중...</p>
                </div>
              ) : furnitureList.length > 0 ? (
                furnitureList.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-[#715845] rounded-lg p-4 flex items-start gap-4"
                  >
                    {/* 가구 이미지 */}
                    <div className="w-16 h-16 bg-[#8d7057] rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#dcccbf] text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 가구 정보 */}
                    <div className="flex-1">
                      <h4 className="font-medium text-[#f5f0eb] mb-1">{item.product_name}</h4>
                      <p className="text-sm text-[#dcccbf] mb-2">
                        {item.brand} • {formatPrice(item.price)}
                      </p>
                      
                      {item.style_tags && item.style_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.style_tags.slice(0, 2).map((tag, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-[#a7896d] text-xs text-white rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* 구매 버튼 */}
                    <Button
                      size="sm"
                      className="bg-[#a7896d] hover:bg-[#b99e86] text-white flex-shrink-0"
                      onClick={() => {
                        if (item.url) {
                          window.open(item.url, '_blank');
                        } else {
                          toast.info("구매 링크가 준비 중입니다.");
                        }
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      구매
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#dcccbf]">추천 가구가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full bg-[#33271e] p-6 space-y-3">
          <Button 
            className="w-full bg-[#a7896d] hover:bg-[#b99e86] text-white py-3"
            disabled={isLoading || furnitureList.length === 0}
            onClick={() => {
              if (furnitureList.length > 0) {
                toast.success(`${furnitureList.length}개 가구가 장바구니에 추가되었습니다!`);
              } else {
                toast.error("추가할 가구가 없습니다.");
              }
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isLoading ? "로딩 중..." : `추천 가구 ${furnitureList.length}개 장바구니에 추가`}
          </Button>
          
          <Link href="/">
            <Button 
              variant="outline"
              className="w-full border-[#a7896d] text-[#e9e1d8] hover:bg-[#715845] py-3"
            >
              새로운 방 분석하기
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}