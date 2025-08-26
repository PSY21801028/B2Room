"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    // 약간의 로딩 효과 후 메인 페이지로 이동
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col items-center justify-center bg-[#f5f0eb] mobile-container">
      {/* 로고 이미지 */}
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative w-full max-w-md">
          <Image
            src="/logonpage.png"
            alt="B2Room Logo"
            width={400}
            height={600}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* 시작 버튼 */}
        <div className="flex flex-col items-center space-y-4 mt-8">
          <Link href="/upload">
            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="px-12 py-4 text-lg font-semibold bg-[#d4a574] hover:bg-[#c19660] text-white rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>시작하는 중...</span>
                </div>
              ) : (
                "시작하기"
              )}
            </Button>
          </Link>
          
          <p className="text-[#d4a574] text-sm font-medium">
            당신의 공간을 더 아름답게
          </p>
        </div>
      </div>

      {/* 하단 장식 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-[#d4a574]/30 rounded-full"></div>
          <div className="w-2 h-2 bg-[#d4a574]/50 rounded-full"></div>
          <div className="w-2 h-2 bg-[#d4a574] rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

