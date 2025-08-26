"use client";

import { ArrowLeft, Home, Download, ShoppingCart, ExternalLink, Sparkles, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function ResultPage() {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  // 가구별 실제 상품 데이터 매핑 (5개씩)
  const furnitureDatabase = {
    bed: [
      { name: "프리미엄 패브릭 침대", price: "1,890,000원", position: { top: "45%", left: "15%" }, link: "https://www.ikea.com/kr/ko/p/malm-bed-frame-high-white-stained-oak-veneer-luroey-s59175197/" },
      { name: "모던 침대 프레임", price: "1,200,000원", position: { top: "45%", left: "15%" }, link: "https://www.ikea.com/kr/ko/p/hemnes-bed-frame-white-stain-luroey-s69175200/" },
      { name: "심플 원목 침대", price: "950,000원", position: { top: "45%", left: "15%" }, link: "https://www.ikea.com/kr/ko/p/tarva-bed-frame-pine-luroey-s99135620/" },
      { name: "럭셔리 가죽 침대", price: "2,500,000원", position: { top: "45%", left: "15%" }, link: "https://www.ikea.com/kr/ko/p/malm-bed-frame-high-white-stained-oak-veneer-luroey-s59175197/" },
      { name: "컴팩트 침대", price: "750,000원", position: { top: "45%", left: "15%" }, link: "https://www.ikea.com/kr/ko/p/brimnes-bed-frame-white-luroey-s59175193/" },
      { name: "스마트 침대", price: "3,200,000원", position: { top: "45%", left: "15%" }, link: "https://www.ikea.com/kr/ko/p/malm-bed-frame-high-white-stained-oak-veneer-luroey-s59175197/" },
      { name: "미니멀 침대", price: "680,000원", position: { top: "45%", left: "15%" }, link: "https://www.ikea.com/kr/ko/p/neiden-bed-frame-pine-s89135717/" },
      { name: "수납형 침대", price: "1,450,000원", position: { top: "45%", left: "15%" }, link: "https://www.ikea.com/kr/ko/p/songesand-bed-frame-with-2-storage-boxes-white-s69318621/" }
    ],
    sofa: [
      { name: "모던 3인용 소파", price: "2,340,000원", position: { top: "55%", left: "45%" }, link: "https://www.ikea.com/kr/ko/p/kivik-sofa-hillared-dark-blue-s59251418/" },
      { name: "컴포트 소파", price: "1,800,000원", position: { top: "55%", left: "45%" }, link: "https://www.ikea.com/kr/ko/p/friheten-sleeper-sectional-3-seat-w-storage-skiftebo-dark-gray-s59175268/" },
      { name: "미니멀 2인 소파", price: "1,200,000원", position: { top: "55%", left: "45%" }, link: "https://www.ikea.com/kr/ko/p/klippan-loveseat-vissle-gray-s59218044/" },
      { name: "패브릭 소파", price: "2,100,000원", position: { top: "55%", left: "45%" }, link: "https://www.ikea.com/kr/ko/p/soderhamn-sofa-finnsta-turquoise-s69285367/" },
      { name: "가죽 소파", price: "3,200,000원", position: { top: "55%", left: "45%" }, link: "https://www.ikea.com/kr/ko/p/lidhult-sofa-grann-bomstad-golden-brown-s59285359/" },
      { name: "리클라이너 소파", price: "2,800,000원", position: { top: "55%", left: "45%" }, link: "https://www.ikea.com/kr/ko/p/poang-armchair-birch-veneer-knisa-light-beige-s99209020/" },
      { name: "코너 소파", price: "3,500,000원", position: { top: "55%", left: "45%" }, link: "https://www.ikea.com/kr/ko/p/vimle-corner-sofa-5-seat-gunnared-beige-s69217879/" },
      { name: "북유럽 소파", price: "1,650,000원", position: { top: "55%", left: "45%" }, link: "https://www.ikea.com/kr/ko/p/stocksund-sofa-ljungen-blue-black-wood-s89285370/" }
    ],
    dining_table: [
      { name: "원목 다이닝 테이블", price: "1,250,000원", position: { top: "45%", left: "70%" }, link: "https://www.ikea.com/kr/ko/p/ekedalen-extendable-table-white-70409220/" },
      { name: "모던 글래스 테이블", price: "890,000원", position: { top: "45%", left: "70%" }, link: "https://www.ikea.com/kr/ko/p/ingatorp-extendable-table-white-70409217/" },
      { name: "대리석 패턴 테이블", price: "1,500,000원", position: { top: "45%", left: "70%" }, link: "https://www.ikea.com/kr/ko/p/laneberg-extendable-table-white-70409218/" },
      { name: "원형 다이닝 테이블", price: "980,000원", position: { top: "45%", left: "70%" }, link: "https://www.ikea.com/kr/ko/p/docksta-table-white-white-s79175209/" },
      { name: "빈티지 우드 테이블", price: "1,350,000원", position: { top: "45%", left: "70%" }, link: "https://www.ikea.com/kr/ko/p/skogsta-dining-table-acacia-s79285341/" }
    ],
    side_table: [
      { name: "비셀리움 프리미엄 원형테이블", price: "45,800원", position: { top: "55%", left: "75%" }, link: "https://smartstore.naver.com/junbigo/products/5321449578?nl-query=%ED%85%8C%EC%9D%B4%EB%B8%94&nl-ts-pid=j62xksqVWdoss5fqYmwssssssZo-521392" },
      { name: "모던 원형 테이블", price: "150,000원", position: { top: "55%", left: "75%" }, link: "https://www.ikea.com/kr/ko/p/gladom-tray-table-white-80339290/" },
      { name: "메탈 사이드 테이블", price: "120,000원", position: { top: "55%", left: "75%" }, link: "https://www.ikea.com/kr/ko/p/kvistbro-storage-table-white-s59285375/" },
      { name: "원목 나이트 테이블", price: "190,000원", position: { top: "55%", left: "75%" }, link: "https://www.ikea.com/kr/ko/p/hemnes-nightstand-white-stain-s59175201/" },
      { name: "미니멀 스틸 테이블", price: "95,000원", position: { top: "55%", left: "75%" }, link: "https://www.ikea.com/kr/ko/p/burvik-side-table-white-s39285378/" }
    ],
    low_table: [
      { name: "좌식 테이블", price: "320,000원", position: { top: "60%", left: "60%" }, link: "https://www.ikea.com/kr/ko/p/lack-coffee-table-white-20011408/" },
      { name: "원목 로우 테이블", price: "450,000원", position: { top: "60%", left: "60%" }, link: "https://www.ikea.com/kr/ko/p/stockholm-coffee-table-walnut-veneer-s79285346/" },
      { name: "글래스 커피테이블", price: "380,000원", position: { top: "60%", left: "60%" }, link: "https://www.ikea.com/kr/ko/p/vittso-coffee-table-white-glass-s89285349/" },
      { name: "스토리지 테이블", price: "280,000원", position: { top: "60%", left: "60%" }, link: "https://www.ikea.com/kr/ko/p/liatorp-coffee-table-white-glass-s89285352/" },
      { name: "미니멀 화이트 테이블", price: "180,000원", position: { top: "60%", left: "60%" }, link: "https://www.ikea.com/kr/ko/p/hemnes-coffee-table-white-stain-s59285355/" }
    ],
    chair: [
      { name: "디자인 체어", price: "680,000원", position: { top: "40%", left: "80%" }, link: "https://www.ikea.com/kr/ko/p/tobias-chair-clear-grey-70394726/" },
      { name: "에르고 오피스 체어", price: "450,000원", position: { top: "40%", left: "80%" }, link: "https://www.ikea.com/kr/ko/p/markus-office-chair-vissle-dark-gray-70394728/" },
      { name: "패브릭 암체어", price: "520,000원", position: { top: "40%", left: "80%" }, link: "https://www.ikea.com/kr/ko/p/strandmon-wing-chair-nordvalla-dark-gray-s59285365/" },
      { name: "우드 다이닝 체어", price: "320,000원", position: { top: "40%", left: "80%" }, link: "https://www.ikea.com/kr/ko/p/stefan-chair-brown-black-s79285368/" },
      { name: "모던 바 스툴", price: "280,000원", position: { top: "40%", left: "80%" }, link: "https://www.ikea.com/kr/ko/p/henriksdal-bar-stool-with-backrest-brown-black-s99285371/" }
    ],
    lamp: [
      { name: "스탠드 조명", price: "290,000원", position: { top: "25%", left: "85%" }, link: "https://www.ikea.com/kr/ko/p/foto-pendant-lamp-white-10416155/" },
      { name: "플로어 램프", price: "180,000원", position: { top: "25%", left: "85%" }, link: "https://www.ikea.com/kr/ko/p/holmo-floor-lamp-white-s59285374/" },
      { name: "테이블 램프", price: "120,000원", position: { top: "25%", left: "85%" }, link: "https://www.ikea.com/kr/ko/p/lampan-table-lamp-white-s69285377/" },
      { name: "아크 플로어 램프", price: "350,000원", position: { top: "25%", left: "85%" }, link: "https://www.ikea.com/kr/ko/p/regolit-floor-lamp-white-s79285380/" },
      { name: "LED 스마트 램프", price: "250,000원", position: { top: "25%", left: "85%" }, link: "https://www.ikea.com/kr/ko/p/forsa-work-lamp-white-s89285383/" }
    ]
  };

  // 가격을 숫자로 변환하는 함수
  const parsePrice = (priceString: string): number => {
    return parseInt(priceString.replace(/[^\d]/g, ''));
  };

  // 평점을 생성하는 함수 (가격대별로 균등 분포)
  const generateRating = (price: number): string => {
    // 시드값을 위해 가격을 사용하여 일관된 랜덤값 생성
    const seed = price * 37; // 임의의 소수
    const random = (seed % 1000) / 1000; // 0-1 사이의 값
    
    // 85% 확률로 4.0-5.0 사이, 15% 확률로 3.0-4.0 사이
    let rating: number;
    if (random < 0.85) {
      // 4.0-5.0 사이 (대부분)
      rating = 4.0 + random * 1.0;
    } else {
      // 3.0-4.0 사이 (소수)
      rating = 3.0 + (random - 0.85) * 6.67 * 1.0;
    }
    
    // 소수점 첫째자리까지 반환
    return rating.toFixed(1);
  };

  // 추천 점수를 계산하는 함수 (평점 + 가격 효율성)
  const calculateRecommendationScore = (product: any): number => {
    const price = parsePrice(product.price);
    const rating = parseFloat(product.rating);
    
    // 평점 70% + 가격 효율성 30%
    const ratingScore = rating * 0.7;
    const priceScore = (1 - Math.min(price / 3000000, 1)) * 0.3; // 가격이 낮을수록 높은 점수
    
    return ratingScore + priceScore;
  };

  // 가격 범위에 맞는 상품을 필터링하고 추천순으로 정렬하는 함수
  const filterAndSortProducts = (products: any[], priceRange?: { min: number; max: number }, furnitureType?: string) => {
    // 평점 추가
    const productsWithRating = products.map(product => ({
      ...product,
      rating: generateRating(parsePrice(product.price))
    }));

    // 가격 범위 필터링 (설정되어 있을 때만)
    let filteredProducts = productsWithRating;
    if (priceRange) {
      filteredProducts = productsWithRating.filter(product => {
        const price = parsePrice(product.price);
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    // 추천순으로 정렬하고 상위 5개만 반환
    let sortedProducts = filteredProducts
      .map(product => ({
        ...product,
        recommendationScore: calculateRecommendationScore(product)
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    // 사이드 테이블의 경우 "비셀리움 프리미엄 원형테이블"을 항상 첫 번째로 고정
    if (furnitureType === 'side_table') {
      const fixedProduct = sortedProducts.find(p => p.name === "비셀리움 프리미엄 원형테이블");
      if (fixedProduct) {
        const otherProducts = sortedProducts.filter(p => p.name !== "비셀리움 프리미엄 원형테이블");
        sortedProducts = [fixedProduct, ...otherProducts];
      }
    }

    return sortedProducts.slice(0, 5); // 항상 5개만
  };

  // localStorage에서 사용자 선호도 불러오기
  useEffect(() => {
    const preferences = localStorage.getItem('userPreferences');
    if (preferences) {
      try {
        const parsed = JSON.parse(preferences);
        setUserPreferences(parsed);
        
        // 선택한 가구들에 해당하는 상품 정보 생성 (추천순 5개씩)
        const products: any[] = [];
        parsed.addFurniture.forEach((furnitureId: string) => {
          const furnitureList = furnitureDatabase[furnitureId as keyof typeof furnitureDatabase];
          if (furnitureList && Array.isArray(furnitureList)) {
            // 가격 범위 필터링 및 추천순 정렬 (5개)
            const recommendedList = filterAndSortProducts(furnitureList, parsed.priceRange, furnitureId);
            
            recommendedList.forEach((furniture, index) => {
              products.push({
                id: products.length + 1,
                furnitureType: furnitureId,
                ...furniture
              });
            });
          }
        });
        
        setRecommendedProducts(products);
      } catch (error) {
        console.error('사용자 선호도 파싱 오류:', error);
      }
    }
  }, []);

  // 상품 정보 토글
  const toggleProductInfo = (productId: number) => {
    setSelectedProduct(selectedProduct === productId ? null : productId);
  };

  const handleImageGeneration = async () => {
    try {
      toast.info("이미지를 다운로드하고 있습니다...");
      
      // output.png 이미지를 가져와서 다운로드
      const response = await fetch('/output.png');
      const blob = await response.blob();
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'B2Room_가구적용사진.png';
      
      // 다운로드 실행
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 메모리 정리
      window.URL.revokeObjectURL(url);
      
      toast.success("이미지가 다운로드되었습니다!");
    } catch (error) {
      console.error('이미지 다운로드 오류:', error);
      toast.error("이미지 다운로드에 실패했습니다.");
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col mobile-container bg-gray-100" style={{
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1631679706909-1844bbd07221?ixlib=rb-4.0.3")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Header */}
      <header className="w-full p-4 bg-black/20 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center justify-between">
          <Link href="/analysis">
            <Button
              variant="ghost"
              size="icon"
              className="flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#a7896d]" />
            <h1 className="text-xl font-semibold text-white">AI 가구추천 결과</h1>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-8">
        <div className="p-6 space-y-6">
          
          {/* 가구 적용 사진 섹션 */}
          <div className="w-full bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-[#f5f0eb] mb-4 flex items-center gap-2">
              <Home className="w-6 h-6" />
              가구 적용 사진
            </h3>

            {/* 가구 적용 이미지 */}
            <div className="relative mb-4 rounded-xl overflow-visible">
              <img 
                src="/output.png" 
                alt="가구 적용 사진"
                className="w-full h-64 object-cover rounded-xl"
              />
              
              {/* 선택한 가구들의 상품 정보 핀들 - 가구 타입별로 첫 번째 상품만 표시 */}
              {Array.from(new Set(recommendedProducts.map(p => p.furnitureType)))
                .map(furnitureType => {
                  const product = recommendedProducts.find(p => p.furnitureType === furnitureType);
                  return product ? (
                    <div
                      key={furnitureType}
                      className="absolute"
                      style={{ top: product.position.top, left: product.position.left }}
                    >
                  {/* 상품 핀 */}
                  <button
                    onClick={() => toggleProductInfo(product.id)}
                    className="relative w-8 h-8 bg-white rounded-full border-4 border-[#a7896d] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <div className="w-2 h-2 bg-[#a7896d] rounded-full"></div>
                    
                    {/* 펄스 애니메이션 */}
                    <div className="absolute inset-0 rounded-full border-4 border-[#a7896d] animate-ping opacity-75"></div>
                  </button>
                  
                  {/* 상품 정보 카드 */}
                  {selectedProduct === product.id && (
                    <div 
                      className={`absolute z-50 bg-white rounded-lg shadow-xl p-4 min-w-[220px] max-w-[280px] border border-gray-200 ${
                        // 핀이 화면 오른쪽에 있으면 카드를 왼쪽으로
                        parseFloat(product.position.left.replace('%', '')) > 70 
                          ? 'top-10 right-0' 
                          // 핀이 화면 왼쪽에 있으면 카드를 오른쪽으로
                          : parseFloat(product.position.left.replace('%', '')) < 30
                          ? 'top-10 left-0'
                          // 가운데 있으면 중앙 정렬
                          : 'top-10 left-1/2 transform -translate-x-1/2'
                      }`}
                    >
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">{product.name}</h4>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <p className="text-sm font-bold text-[#a7896d]">{product.price}</p>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                            onClick={() => window.open(product.link, '_blank')}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            구매
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white px-2"
                            onClick={() => window.open(product.link, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                  </div>
                </div>
                      
                      {/* 말풍선 꼬리 - 위치에 따라 조정 */}
                      <div 
                        className={`absolute w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200 ${
                          parseFloat(product.position.left.replace('%', '')) > 70 
                            ? '-top-2 right-4' 
                            : parseFloat(product.position.left.replace('%', '')) < 30
                            ? '-top-2 left-4'
                            : '-top-2 left-1/2 transform -translate-x-1/2'
                        }`}
                      ></div>
                    </div>
                  )}
                    </div>
                  ) : null;
                })
              }
            </div>

            {/* 안내 텍스트 */}
            <div className="flex items-center gap-2 text-sm text-[#a7896d] bg-[#33271e] rounded-lg p-3">
              <Info className="w-4 h-4" />
              <span>이미지 위의 핀을 클릭하면 가구 정보를 확인할 수 있습니다</span>
            </div>
          </div>

          {/* 설정된 가격 범위 표시 */}
          {userPreferences?.priceRange && (
            <div className="w-full bg-black/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-center">
                <p className="text-sm text-[#e9e1d8] mb-1">설정된 예산 범위</p>
                <p className="text-lg font-bold text-[#a7896d]">
                  ₩{userPreferences.priceRange.min.toLocaleString()} - ₩{userPreferences.priceRange.max.toLocaleString()}
                </p>
                <p className="text-xs text-[#a7896d] mt-1">이 범위 내의 상품만 추천됩니다</p>
                </div>
                        </div>
                      )}

          {/* 추천 상품 리스트 섹션 */}
          <div className="w-full bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-[#f5f0eb] mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              추천 가구 상품
              <span className="text-sm font-normal text-[#a7896d]">(추천순 정렬)</span>
            </h3>

            {recommendedProducts.length > 0 ? (
              <div className="space-y-4">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="bg-[#33271e] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#f5f0eb] mb-1">{product.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-[#a7896d]">{product.price}</p>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                    <Button
                      size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => window.open(product.link, '_blank')}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        구매하기
                    </Button>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-8">
                <p className="text-[#a7896d] mb-4">선택한 가구가 없습니다.</p>
                <Link href="/analysis">
                  <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-500 hover:text-white">
                    가구 선택하러 가기
                  </Button>
                </Link>
                </div>
              )}
        </div>

          {/* 액션 버튼들 */}
          <div className="w-full space-y-3">
          <Button 
              onClick={handleImageGeneration}
              className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 text-white py-4 rounded-xl font-semibold text-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              이미지 다운로드
          </Button>
          
          <Link href="/">
            <Button 
              className="w-full bg-black/60 backdrop-blur-sm border-2 border-white/30 hover:bg-black/80 text-white py-4 rounded-xl font-semibold text-lg"
            >
                <Home className="w-5 h-5 mr-2" />
                처음으로 돌아가기
            </Button>
          </Link>
          </div>
        </div>
      </main>
    </div>
  );
}