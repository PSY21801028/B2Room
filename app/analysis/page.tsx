"use client";

import { ArrowLeft, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { supabase } from "@/utils/supabase/client";

export default function AnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info("이미지 분석을 시작합니다...");

    // ✅ Supabase 연결 테스트
    try {
      const { data, error } = await supabase.from("furniture_attributes").select("*").limit(1);

      if (error) {
        console.error(error);
        toast.error("Supabase 연결 실패 ❌");
      } else {
        console.log("Supabase 데이터:", data);
        toast.success("Supabase 연결 성공 ✅");
      }
    } catch (err) {
      console.error(err);
      toast.error("Supabase 호출 중 오류 발생 ❌");
    }

    // 분석 진행률 시뮬레이션
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(i);
      if (i === 40) toast.info("분위기 분석 중...");
      if (i === 60) toast.info("공간 분석 중...");
      if (i === 80) toast.info("가구 객체 탐지 중...");
    }

    toast.success("분석이 완료되었습니다!");
    setIsAnalyzing(false);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#33271e] mobile-container">
      {/* Header */}
      <header className="absolute top-0 z-20 w-full p-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-white">방 이미지 분석</h1>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center bg-[#5d4837] pt-20">
        <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
          <div className="mb-8 flex flex-col items-center gap-4">
            {/* Analysis Icon */}
            <div className="text-[#a7896d]">
              <Search className="w-20 h-20" />
            </div>
            <h2 className="text-2xl font-bold text-[#f5f0eb]">2-1. 분위기 분석</h2>
            <div className="space-y-2 text-[#e9e1d8]">
              <p>• 인테리어 스타일 (모던/미니멀/내추럴 등)</p>
              <p>• 기타 감성 키워드</p>
            </div>
          </div>

          <div className="mb-8 flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-[#f5f0eb]">2-2. 공간 분석</h2>
            <div className="space-y-2 text-[#e9e1d8]">
              <p>• 가구 객체 탐지 및 분할</p>
              <p>• 깊이감 및 가구 간 거리 분석</p>
            </div>
          </div>

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="w-full max-w-sm mb-6">
              <div className="bg-[#715845] rounded-full h-3">
                <div 
                  className="bg-[#c9b19e] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[#dcccbf] text-sm mt-2">{progress}% 완료</p>
            </div>
          )}

          {/* Start Analysis Button */}
          {!isAnalyzing && (
            <Button
              onClick={startAnalysis}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#a7896d] text-white transition-transform active:scale-95 hover:bg-[#b99e86]"
            >
              <Eye className="w-8 h-8" />
            </Button>
          )}
        </div>

        {/* Continue Button */}
        <div className="w-full bg-[#33271e] p-6 pb-8">
          <Link href="/input">
            <Button
              disabled={isAnalyzing}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#715845] py-4 px-6 text-lg font-semibold text-[#f5f0eb] transition-colors hover:bg-[#8d7057] disabled:opacity-50"
            >
              <span>사용자 입력 단계로 →</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
