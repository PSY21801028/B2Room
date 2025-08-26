"use client";

import { ArrowLeft, Search, Eye, Bed, Sofa, ChefHat, Coffee, Lamp, Armchair, Table, Trash2, Plus, Loader2, UtensilsCrossed, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [selectedRemoveFurniture, setSelectedRemoveFurniture] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 10000, max: 5000000 });
  const router = useRouter();

  // 분석 결과 로드
  useEffect(() => {
    const storedResult = localStorage.getItem('analysisResult');
    const storedImage = localStorage.getItem('capturedImage');
    
    if (storedResult) {
      try {
        const result = JSON.parse(storedResult);
        setAnalysisResult(result);
        console.log('분석 결과 로드됨:', result);
        console.log('서버 응답 구조:', {
          keys: Object.keys(result),
          result: result.result,
          prediction: result.prediction,
          style: result.style
        });
      } catch (error) {
        console.error('분석 결과 파싱 오류:', error);
      }
    }
    
    // 기본 이미지로 inter.jpg 사용, 사용자 이미지가 있으면 우선 사용
    if (storedImage) {
      setOriginalImage(storedImage);
      } else {
      setOriginalImage('/inter.jpg');
    }
  }, []);

  // 인테리어 스타일 옵션
  const styles = [
    { id: "modern", label: "모던", desc: "깔끔하고 세련된" },
    { id: "natural", label: "내추럴", desc: "자연스럽고 따뜻한" },
    { id: "minimal", label: "미니멀", desc: "단순하고 기능적인" },
    { id: "vintage", label: "빈티지", desc: "고전적이고 개성있는" },
    { id: "classic", label: "클래식", desc: "우아하고 전통적인" }
  ];

  // 추가하고 싶은 가구 옵션 (더 적합한 아이콘 매칭)
  const furnitureOptions = [
    { id: "bed", label: "침대", icon: Bed },
    { id: "sofa", label: "소파", icon: Sofa },
    { id: "dining_table", label: "식탁", icon: UtensilsCrossed },
    { id: "side_table", label: "사이드테이블", icon: Coffee },
    { id: "low_table", label: "좌식테이블", icon: Square },
    { id: "chair", label: "의자", icon: Armchair },
    { id: "lamp", label: "스탠드", icon: Lamp }
  ];

  // 제거하고 싶은 가구 예시 (실제로는 SAM 모델 결과에서 생성)
  const removeFurnitureOptions = [
    { 
      id: "remove_lamp", 
      label: "스탠드", 
      thumbnail: "/lamp.png" 
    },
    { 
      id: "remove_bed", 
      label: "침대", 
      thumbnail: "/bed.png" 
    },
    { 
      id: "remove_side_table", 
      label: "사이드테이블", 
      thumbnail: "/table.png" 
    }
  ];

  const toggleFurniture = (furnitureId: string) => {
    setSelectedFurniture(prev => 
      prev.includes(furnitureId) 
        ? prev.filter(id => id !== furnitureId)
        : [...prev, furnitureId]
    );
  };

  const toggleRemoveFurniture = (furnitureId: string) => {
    setSelectedRemoveFurniture(prev => 
      prev.includes(furnitureId) 
        ? prev.filter(id => id !== furnitureId)
        : [...prev, furnitureId]
    );
  };

  // 분석 결과에서 스타일 텍스트 추출하는 헬퍼 함수
  const getStyleFromResult = (result: any): string => {
    if (!result) return "모던 미니멀";
    
    // result가 문자열인 경우
    if (typeof result === 'string') return result;
    
    // result가 객체인 경우 깊이 탐색
    if (typeof result === 'object') {
      // 첫 번째 레벨에서 시도
      const firstLevel = result.result || result.style || result.prediction || result.label || result.class;
      if (firstLevel && typeof firstLevel === 'string') {
        return firstLevel;
      }
      
      // 중첩된 객체에서 시도 (예: {image: "...", result: "스타일"} 구조)
      if (firstLevel && typeof firstLevel === 'object') {
        return firstLevel.result || firstLevel.style || firstLevel.prediction || firstLevel.label || firstLevel.class || "모던 미니멀";
      }
      
      // 배열인 경우 첫 번째 요소 시도
      if (Array.isArray(firstLevel) && firstLevel.length > 0) {
        const firstItem = firstLevel[0];
        if (typeof firstItem === 'string') return firstItem;
        if (typeof firstItem === 'object') {
          return firstItem.result || firstItem.style || firstItem.prediction || firstItem.label || firstItem.class || "모던 미니멀";
        }
      }
    }
    
    return "모던 미니멀";
  };

  const handleSubmit = async () => {
    if (!selectedStyle) {
      toast.error("원하는 인테리어 스타일을 선택해주세요.");
      return;
    }
    
    setIsLoading(true);
    toast.info("인테리어 추천을 생성하고 있습니다...");
    
    const formData = {
      style: selectedStyle,
      addFurniture: selectedFurniture,
      removeFurniture: selectedRemoveFurniture,
      analysisResult: analysisResult,
      priceRange: priceRange
    };
    
    try {
      // 사용자 선호도를 localStorage에 저장
      localStorage.setItem('userPreferences', JSON.stringify(formData));
      
      console.log('사용자 입력 데이터:', formData);
      
      // 로딩 시뮬레이션 (2-3초)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      toast.success("인테리어 추천이 완료되었습니다!");
      
      // result 페이지로 이동
      router.push('/result');
      
    } catch (error) {
      console.error('추천 생성 오류:', error);
      toast.error("추천 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col mobile-container bg-gray-100" style={{
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Header */}
      <header className="w-full p-4 bg-black/20 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-8 w-8" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-white">선호도 입력</h1>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-8">
        <div className="p-6 space-y-6">
          
          {/* 분석 결과 표시 */}
          {analysisResult && (
            <div className="w-full bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-[#f5f0eb] mb-4 text-center">
                당신의 방은 "
                <span className="text-[#a7896d]">
                  {getStyleFromResult(analysisResult)}
                </span>
                " 한 스타일입니다
              </h2>
              
              {/* 원본 이미지 표시 */}
              {originalImage && (
                <div className="mb-4 rounded-xl overflow-hidden bg-gray-100">
                  <Image 
                    src={originalImage} 
                    alt="분석된 방 이미지" 
                    width={800} 
                    height={600}
                    className="w-full h-auto object-contain max-h-96"
                    priority
                    onError={(e) => {
                      console.error('메인 이미지 로딩 에러:', originalImage);
                      setOriginalImage('/inter.jpg'); // 기본 이미지로 폴백
                    }}
                  />
                </div>
              )}
              
              {/* 분석 상세 정보 */}
              <div className="bg-[#33271e] rounded-xl p-4 space-y-2">
                {analysisResult.isOfflineMode ? (
                  <div className="bg-orange-900/50 border border-orange-400/30 rounded-lg p-3 mb-3">
                    <p className="text-orange-200 text-sm">
                      <span className="font-semibold">⚠️ 오프라인 모드:</span> 서버 연결에 실패하여 기본 분석 결과를 사용하고 있습니다. 
                      나중에 서버가 연결되면 더 정확한 분석이 가능합니다.
                    </p>
                  </div>
                ) : (
                  <p className="text-[#e9e1d8] text-sm">
                    <span className="font-semibold">분석 완료:</span> 당신의 공간을 분석하기 위해서 분위기, 가구, 인테리어 유형 등을 파악했습니다.
                  </p>
                )}
                {analysisResult.confidence && (
                  <p className="text-[#a7896d] text-sm">
                    분석 정확도: {Math.round(analysisResult.confidence * 100)}%
                  </p>
                )}
                
                {/* 서버 응답 원본 데이터 표시 (디버깅용) */}
                <details className="mt-3">
                  <summary className="text-[#a7896d] text-xs cursor-pointer hover:text-[#c9b19e]">
                    🔍
                  </summary>
                  <pre className="text-xs text-[#dcccbf] mt-2 p-2 bg-[#5d4837] rounded overflow-auto max-h-32">
                    {JSON.stringify(analysisResult, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* 기본 메시지 (분석 결과가 없는 경우) */}
          {!analysisResult && (
            <div className="w-full bg-black/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <h2 className="text-2xl font-bold text-[#f5f0eb] mb-4">
                당신의 방은 "
                <span className="text-[#a7896d]">모던 미니멀</span>
                " 한 스타일입니다
              </h2>
              
              <div className="bg-[#33271e] rounded-xl p-4">
                <p className="text-[#e9e1d8] text-sm">
                  분석 결과를 불러오는 중입니다...
                </p>
              </div>
            </div>
          )}

          {/* 인테리어 스타일 선택 */}
          <div className="w-full bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-[#f5f0eb] mb-4 flex items-center gap-2">
              <Search className="w-6 h-6" />
              원하는 인테리어 스타일
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedStyle === style.id
                      ? 'border-white bg-white/30 backdrop-blur-sm'
                      : 'border-white/30 bg-black/40 hover:border-white/50 hover:bg-white/20'
                  }`}
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-[#f5f0eb] mb-1">{style.label}</h4>
                    <p className="text-sm text-[#a7896d]">{style.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 넣고 싶은 가구 선택 */}
          <div className="w-full bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-[#f5f0eb] mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              넣고 싶은 가구
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {furnitureOptions.map((furniture) => {
                const IconComponent = furniture.icon;
                const isSelected = selectedFurniture.includes(furniture.id);
                
                return (
                  <button
                    key={furniture.id}
                    onClick={() => toggleFurniture(furniture.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-white bg-white/30 backdrop-blur-sm'
                        : 'border-white/30 bg-black/40 hover:border-white/50 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <IconComponent className={`w-8 h-8 ${isSelected ? 'text-[#f5f0eb]' : 'text-[#a7896d]'}`} />
                      <span className={`font-medium ${isSelected ? 'text-[#f5f0eb]' : 'text-[#a7896d]'}`}>
                        {furniture.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 제거하고 싶은 가구 선택 */}
          <div className="w-full bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-[#f5f0eb] mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              제거하고 싶은 가구
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {removeFurnitureOptions.map((furniture) => {
                const isSelected = selectedRemoveFurniture.includes(furniture.id);
                
                return (
                  <button
                    key={furniture.id}
                    onClick={() => toggleRemoveFurniture(furniture.id)}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-red-400 bg-red-900/30'
                        : 'border-[#715845] bg-[#33271e] hover:border-[#8d7057]'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                        {imageLoadError.includes(furniture.id) ? (
                          <span className="text-xs text-gray-500">{furniture.label}</span>
                        ) : furniture.thumbnail.startsWith('/') ? (
                          <Image 
                            src={furniture.thumbnail} 
                            alt={furniture.label}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('이미지 로딩 에러:', furniture.thumbnail);
                              setImageLoadError(prev => [...prev, furniture.id]);
                            }}
                          />
                        ) : (
                          <img 
                            src={furniture.thumbnail} 
                            alt={furniture.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('이미지 로딩 에러:', furniture.thumbnail);
                              setImageLoadError(prev => [...prev, furniture.id]);
                            }}
                          />
                        )}
                      </div>
                      <span className={`text-sm font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis ${isSelected ? 'text-red-300' : 'text-[#a7896d]'}`}>
                        {furniture.label}
                      </span>
                      
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 rounded-xl">
                          <Trash2 className="w-8 h-8 text-red-300" />
                        </div>
                      )}
              </div>
                  </button>
                );
              })}
            </div>
            
            <p className="text-sm text-[#a7896d] mt-3 text-center">
              AI가 감지한 가구들입니다. 제거할 가구를 선택하세요.
            </p>
        </div>

          {/* 견적 설정 섹션 */}
          <div className="w-full bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-[#f5f0eb] mb-4 flex items-center gap-2">
              <Search className="w-6 h-6" />
              예산 범위 설정
            </h3>
            
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-lg font-bold text-[#a7896d]">
                  ₩{priceRange.min.toLocaleString()} - ₩{priceRange.max.toLocaleString()}
                </p>
                <p className="text-sm text-[#e9e1d8] mt-1">
                  선택한 가격 범위 내에서 가구를 추천해드립니다
                </p>
              </div>

              {/* 최소 가격 설정 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#f5f0eb]">최소 예산</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="10000"
                    value={priceRange.min}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      if (newMin < priceRange.max) {
                        setPriceRange(prev => ({ ...prev, min: newMin }));
                      }
                    }}
                    className="flex-1 h-2 bg-[#33271e] rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="number"
                    step="10000"
                    value={priceRange.min}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setPriceRange(prev => ({ ...prev, min: 0 }));
                        return;
                      }
                      
                      const newMin = parseInt(value);
                      if (!isNaN(newMin)) {
                        setPriceRange(prev => ({ ...prev, min: newMin }));
                      }
                    }}
                    onBlur={(e) => {
                      // 포커스를 잃었을 때 유효하지 않은 값 보정
                      const value = parseInt(e.target.value);
                      let correctedMin = value;
                      
                      // 최소값은 만원(10,000원) 고정
                      if (isNaN(value) || value < 10000) {
                        correctedMin = 10000;
                      } else if (value > 10000000) {
                        correctedMin = 10000000;
                      } else if (value >= priceRange.max) {
                        correctedMin = Math.max(10000, priceRange.max - 50000);
                      }
                      
                      setPriceRange(prev => ({ ...prev, min: correctedMin }));
                    }}
                    className="w-24 px-2 py-1 text-xs bg-[#33271e] border border-white/20 rounded text-white text-center focus:border-[#a7896d] focus:outline-none"
                    placeholder="최소금액"
                  />
                </div>
                <div className="flex justify-between text-xs text-[#a7896d]">
                  <span>₩10,000</span>
                  <span>₩1,000,000</span>
                </div>
              </div>

              {/* 최대 가격 설정 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#f5f0eb]">최대 예산</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="50000"
                    value={priceRange.max}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      if (newMax > priceRange.min) {
                        setPriceRange(prev => ({ ...prev, max: newMax }));
                      }
                    }}
                    className="flex-1 h-2 bg-[#33271e] rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="number"
                    step="50000"
                    value={priceRange.max}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setPriceRange(prev => ({ ...prev, max: 0 }));
                        return;
                      }
                      
                      const newMax = parseInt(value);
                      if (!isNaN(newMax)) {
                        setPriceRange(prev => ({ ...prev, max: newMax }));
                      }
                    }}
                    onBlur={(e) => {
                      // 포커스를 잃었을 때 유효하지 않은 값 보정
                      const value = parseInt(e.target.value);
                      let correctedMax = value;
                      
                      if (isNaN(value) || value < 50000) {
                        correctedMax = 5000000;
                      } else if (value > 20000000) {
                        correctedMax = 20000000;
                      } else if (value <= priceRange.min) {
                        correctedMax = Math.max(priceRange.min + 50000, 5000000);
                      }
                      
                      setPriceRange(prev => ({ ...prev, max: correctedMax }));
                    }}
                    className="w-28 px-2 py-1 text-xs bg-[#33271e] border border-white/20 rounded text-white text-center focus:border-[#a7896d] focus:outline-none"
                    placeholder="최대금액"
                  />
                </div>
                <div className="flex justify-between text-xs text-[#a7896d]">
                  <span>₩100,000</span>
                  <span>₩10,000,000</span>
                </div>
              </div>

              {/* 프리셋 버튼들 */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => setPriceRange({ min: 10000, max: 500000 })}
                  className="px-3 py-2 rounded-lg border border-white/30 bg-black/40 hover:border-white/50 hover:bg-white/20 text-white text-sm transition-all"
                >
                  저가형 (50만원 이하)
                </button>
                <button
                  onClick={() => setPriceRange({ min: 300000, max: 1500000 })}
                  className="px-3 py-2 rounded-lg border border-white/30 bg-black/40 hover:border-white/50 hover:bg-white/20 text-white text-sm transition-all"
                >
                  중가형 (30-150만원)
                </button>
                <button
                  onClick={() => setPriceRange({ min: 1000000, max: 5000000 })}
                  className="px-3 py-2 rounded-lg border border-white/30 bg-black/40 hover:border-white/50 hover:bg-white/20 text-white text-sm transition-all"
                >
                  고가형 (100-500만원)
                </button>
                <button
                  onClick={() => setPriceRange({ min: 10000, max: 10000000 })}
                  className="px-3 py-2 rounded-lg border border-white/30 bg-black/40 hover:border-white/50 hover:bg-white/20 text-white text-sm transition-all"
                >
                  전체 범위
                </button>
              </div>
            </div>
          </div>

          {/* 완료 버튼 */}
          <div className="w-full pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  추천 생성 중...
                </>
              ) : (
                "인테리어 추천 받기"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}