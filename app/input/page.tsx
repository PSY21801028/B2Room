"use client";

import { ArrowLeft, User, Home, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function InputPage() {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  
  const styles = [
    { id: "modern", label: "모던", desc: "깔끔하고 세련된" },
    { id: "minimal", label: "미니멀", desc: "단순하고 기능적인" },
    { id: "natural", label: "내추럴", desc: "자연스럽고 따뜻한" },
    { id: "vintage", label: "빈티지", desc: "고전적이고 개성있는" }
  ];

  const spaces = [
    { id: "living", label: "거실", desc: "휴식과 소통의 공간" },
    { id: "bedroom", label: "침실", desc: "편안한 휴식 공간" },
    { id: "kitchen", label: "주방", desc: "요리와 식사 공간" },
    { id: "study", label: "서재", desc: "집중과 학습 공간" }
  ];

  const handleSubmit = () => {
    if (!selectedStyle || !selectedSpace) {
      toast.error("분위기와 공간을 모두 선택해주세요.");
      return;
    }
    
    toast.success("입력이 완료되었습니다!");
    // 결과 페이지로 이동
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#33271e] mobile-container">
      {/* Header */}
      <header className="absolute top-0 z-20 w-full p-4">
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
          <h1 className="text-xl font-semibold text-white">사용자 입력</h1>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col bg-[#5d4837] pt-20 pb-6">
        <div className="flex-1 px-6 space-y-6">
          {/* User Input Section */}
          <div className="text-center mb-8">
            <User className="w-16 h-16 mx-auto text-[#a7896d] mb-4" />
            <h2 className="text-xl font-semibold text-[#f5f0eb]">원하는 분위기 선택 (유저/번호)</h2>
          </div>

          {/* Style Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#e9e1d8]">🎨 인테리어 스타일</h3>
            <div className="grid grid-cols-2 gap-3">
              {styles.map((style) => (
                <Button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  variant={selectedStyle === style.id ? "default" : "outline"}
                  className={`h-auto p-4 flex-col gap-2 ${
                    selectedStyle === style.id 
                      ? "bg-[#a7896d] text-white" 
                      : "bg-transparent border-[#a7896d] text-[#e9e1d8] hover:bg-[#715845]"
                  }`}
                >
                  <div className="font-semibold">{style.label}</div>
                  <div className="text-xs opacity-80">{style.desc}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Space Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#e9e1d8]">🏠 구매 가구 선택 (침대/책상 등)</h3>
            <div className="grid grid-cols-2 gap-3">
              {spaces.map((space) => (
                <Button
                  key={space.id}
                  onClick={() => setSelectedSpace(space.id)}
                  variant={selectedSpace === space.id ? "default" : "outline"}
                  className={`h-auto p-4 flex-col gap-2 ${
                    selectedSpace === space.id 
                      ? "bg-[#a7896d] text-white" 
                      : "bg-transparent border-[#a7896d] text-[#e9e1d8] hover:bg-[#715845]"
                  }`}
                >
                  <div className="font-semibold">{space.label}</div>
                  <div className="text-xs opacity-80">{space.desc}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-[#715845] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#e9e1d8] mb-2">📋 제거하고 싶은 기존 가구 선택</h3>
            <p className="text-xs text-[#dcccbf]">분석된 기존 가구 중에서 교체하고 싶은 항목을 선택할 수 있습니다.</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full bg-[#33271e] p-6">
          <Link href="/result">
            <Button
              onClick={handleSubmit}
              disabled={!selectedStyle || !selectedSpace}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#715845] py-4 px-6 text-lg font-semibold text-[#f5f0eb] transition-colors hover:bg-[#8d7057] disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>추천 결과 확인하기</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
