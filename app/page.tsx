"use client";

import { Camera, Image, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function PhotoUploadPage() {
  const [isLoading, setIsLoading] = useState(false);


  
  const handleCameraCapture = async () => {
    setIsLoading(true);
    toast.info("카메라를 열고 있습니다...");
    
    try {
      // 실제 카메라 기능은 나중에 구현
      setTimeout(() => {
        toast.success("카메라가 준비되었습니다!");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("카메라를 열 수 없습니다.");
      setIsLoading(false);
    }
  };

  const handleGallerySelect = async () => {
    setIsLoading(true);
    toast.info("갤러리를 열고 있습니다...");
    
    try {
      // 실제 갤러리 기능은 나중에 구현
      setTimeout(() => {
        toast.success("갤러리가 준비되었습니다!");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("갤러리를 열 수 없습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#33271e] mobile-container">
      {/* Header */}
      <header className="absolute top-0 z-20 w-full p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10"
          >
            <X className="h-8 w-8" />
          </Button>
          <h1 className="text-xl font-semibold text-white">방 사진 업로드</h1>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center bg-[#5d4837]">
        <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
          <div className="mb-8 flex flex-col items-center gap-4">
            {/* Camera Icon */}
            <div className="text-[#a7896d]">
              <Camera className="w-20 h-20" />
            </div>
            <p className="text-lg font-medium text-[#f5f0eb]">
              카메라를 열어 공간을 촬영하거나<br/>
              갤러리에서 사진을 선택하세요.
            </p>
          </div>

          {/* Camera Capture Button */}
          <Button
            onClick={handleCameraCapture}
            disabled={isLoading}
            className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#f5f0eb] bg-transparent p-2 transition-transform active:scale-95 hover:bg-transparent"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f5f0eb]">
              <Camera className="w-12 h-12 text-[#5d4837]" />
            </div>
          </Button>
          <p className="mt-4 text-base font-semibold text-[#f5f0eb]">사진 촬영</p>
        </div>

        {/* Bottom Gallery Button */}
        <div className="w-full bg-[#33271e] p-6 pb-8 space-y-3">
          <Button
            onClick={handleGallerySelect}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#715845] py-4 px-6 text-lg font-semibold text-[#f5f0eb] transition-colors hover:bg-[#8d7057]"
          >
            <Image className="w-6 h-6" />
            <span>갤러리에서 불러오기</span>
          </Button>
          
          {/* Demo Navigation */}
          <div className="space-y-2">
            <Link href="/analysis">
              <Button
                variant="outline"
                className="w-full border-[#a7896d] text-[#e9e1d8] hover:bg-[#715845] py-3"
              >
                데모: 분석 단계로 바로 이동
              </Button>
            </Link>
            
            <Link href="/result">
              <Button
                variant="outline"
                className="w-full border-[#a7896d] text-[#e9e1d8] hover:bg-[#715845] py-2 text-sm"
              >
                📊 가구 추천 결과 보기 (DB 연동 테스트)
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}