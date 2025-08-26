"use client";

import { Camera, Image, X, BarChart3, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadImageToAnalyze, base64ToFile } from "@/lib/api-client";
import NextImage from "next/image";

export default function PhotoUploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashOpacity, setSplashOpacity] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 스플래시 스크린 로직
  useEffect(() => {
    // 프로그레스 바 애니메이션
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // 2%씩 증가
      });
    }, 50); // 50ms마다 업데이트

    const timer = setTimeout(() => {
      // 페이드 아웃 시작
      setSplashOpacity(0);
      
      // 페이드 아웃 완료 후 스플래시 숨김
      setTimeout(() => {
        setShowSplash(false);
      }, 800); // 페이드 아웃 애니메이션 시간
    }, 2500); // 2.5초 후 페이드 아웃 시작

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);


  
  // 디바이스 타입 감지
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // 카메라 스트림 시작
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // 후면 카메라 우선
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return true;
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      return false;
    }
  };

  // 카메라 스트림 중지
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // 사진 촬영
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
        toast.success("사진이 촬영되었습니다!");
      }
    }
  };

  // 메인 카메라 핸들러
  const handleCameraCapture = async () => {
    setIsLoading(true);
    toast.info("카메라를 열고 있습니다...");
    
    try {
      if (isMobile()) {
        // 모바일: 파일 입력으로 카메라 앱 실행
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      } else {
        // PC: 웹캠 스트림 시작
        const success = await startCamera();
        if (success) {
          setShowCamera(true);
          toast.success("카메라가 준비되었습니다!");
        } else {
          toast.error("카메라에 접근할 수 없습니다.");
        }
      }
    } catch (error) {
      console.error('카메라 오류:', error);
      toast.error("카메라를 열 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 모바일 파일 입력 핸들러
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCapturedImage(e.target.result as string);
          toast.success("사진이 선택되었습니다!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallerySelect = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  // 분석 시작 - FastAPI 서버로 이미지 전송 (서버 연결 실패시 기본값으로 진행)
  const handleStartAnalysis = async () => {
    if (!capturedImage) {
      toast.error("먼저 사진을 촬영하거나 선택해주세요.");
      return;
    }
    
    setIsAnalyzing(true);
    toast.info("이미지를 분석 서버로 전송 중...");
    
    try {
      // Base64 이미지를 File 객체로 변환
      const imageFile = base64ToFile(capturedImage);
      
      // FastAPI 서버로 이미지 업로드 및 분석 요청
      const result = await uploadImageToAnalyze(imageFile);
      
      if (result.success && result.data) {
        toast.success(result.message);
        
        // 분석 결과를 로컬 스토리지에 저장 (새로운 구조)
        localStorage.setItem('analysisResult', JSON.stringify(result.data.analysis));
        localStorage.setItem('analysisMetadata', JSON.stringify(result.data.metadata));
        localStorage.setItem('capturedImage', capturedImage);
        
        console.log('분석 완료:', {
          processingTime: result.data.metadata.processingTime,
          timestamp: result.data.metadata.timestamp
        });
        
        // 분석 페이지로 이동
        router.push('/analysis');
      } else {
        // 서버 연결 실패시 기본값으로 진행
        console.warn('서버 연결 실패, 기본값으로 진행:', result.error);
        toast.warning("서버 연결에 실패했지만 기본 분석으로 진행합니다.");
        
        // 기본 분석 결과 생성
        const defaultAnalysisResult = {
          result: "클래식",
          style: "classic",
          confidence: 0.75,
          description: "고급스럽고 세련된 클래식 스타일의 인테리어입니다.",
          timestamp: new Date().toISOString()
        };
        
        // 기본값을 로컬 스토리지에 저장
        localStorage.setItem('analysisResult', JSON.stringify(defaultAnalysisResult));
        localStorage.setItem('capturedImage', capturedImage);
        
        toast.success("기본 분석이 완료되었습니다!");
        
        // 분석 페이지로 이동
        router.push('/analysis');
      }
      
    } catch (error) {
      console.error("분석 오류:", error);
      console.warn('서버 연결 오류, 기본값으로 진행');
      
      // 완전히 실패해도 기본값으로 진행
      toast.warning("서버 연결에 실패했지만 기본 분석으로 진행합니다.");
      
      // 기본 분석 결과 생성
      const defaultAnalysisResult = {
        result: "모던 미니멀",
        style: "modern", 
        confidence: 0.75,
        description: "깔끔하고 세련된 모던 스타일의 인테리어입니다.",
        timestamp: new Date().toISOString(),
        isOfflineMode: true
      };
      
      // 기본값을 로컬 스토리지에 저장
      localStorage.setItem('analysisResult', JSON.stringify(defaultAnalysisResult));
      localStorage.setItem('capturedImage', capturedImage);
      
      toast.success("오프라인 분석이 완료되었습니다!");
      
      // 분석 페이지로 이동
      router.push('/analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 새로운 사진 촬영
  const handleRetakePhoto = () => {
    setCapturedImage(null);
    if (isMobile()) {
      handleCameraCapture();
    } else {
      handleCameraCapture();
    }
  };

  // 스플래시 스크린이 표시될 때
  if (showSplash) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#f5f0eb]"
        style={{
          opacity: splashOpacity,
          transition: 'opacity 0.8s ease-in-out'
        }}
      >
        <div className="flex flex-col items-center justify-center h-full w-full p-8">
          <div className="flex-1 flex items-center justify-center w-full relative">
            <NextImage
              src="/홈화면페이지.png"
              alt="B2Room Logo"
              width={400}
              height={600}
              className="max-w-full max-h-full object-contain"
              priority
            />
            
            {/* 이미지 위 프로그레스 바 */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 max-w-xs">
              <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                <div 
                  className="bg-[#d4a574] h-2 rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <div className="text-center mt-2">
                <span className="text-[#d4a574] text-sm font-medium">
                  {loadingProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col mobile-container bg-gray-100" style={{
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      
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
      <main className="relative flex flex-1 flex-col items-center justify-center z-15">
        {/* 카메라 뷰 (PC용) */}
        {showCamera && (
          <div className="absolute inset-0 z-30 bg-black flex flex-col">
            <div className="flex justify-between items-center p-4 bg-black/50">
              <Button
                onClick={stopCamera}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </Button>
              <h2 className="text-white text-lg font-semibold">사진 촬영</h2>
              <div className="w-10"></div>
            </div>
            
            <div className="flex-1 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-6 bg-black/50 flex justify-center">
              <Button
                onClick={takePhoto}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-transparent p-2 hover:bg-white/10"
              >
                <div className="h-full w-full rounded-full bg-white"></div>
              </Button>
            </div>
          </div>
        )}

        {/* 캔버스 (사진 촬영용) */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* 숨겨진 파일 입력들 */}
        {/* 카메라용 입력 (모바일에서 카메라 앱 실행) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {/* 갤러리용 입력 (갤러리에서 파일 선택) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
          {capturedImage ? (
            /* 촬영된 이미지 표시 */
            <div className="w-full max-w-md space-y-6">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="촬영된 사진" 
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 text-white py-3 rounded-xl disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5 mr-2" />
                      분석 시작
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleRetakePhoto}
                  variant="outline"
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  다시 촬영
                </Button>
              </div>
            </div>
          ) : (
            /* 기본 카메라 UI */
            <>
              <div className="mb-8 flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold text-white text-center leading-relaxed">
                  방의 양쪽 끝이 나오도록<br/>
                  사진을 촬영하세요
                </h2>
              </div>

              {/* Camera Capture Button */}
              <div className="flex flex-col items-center gap-6 mb-16">
                <Button
                  onClick={handleCameraCapture}
                  disabled={isLoading}
                  className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-sm p-2 transition-transform active:scale-95 hover:bg-white/30"
                >
                  <img 
                    src="/camera_icon.png" 
                    alt="카메라" 
                    className="w-12 h-12 object-contain"
                  />
                </Button>
                <p className="text-xl font-medium text-white">촬영</p>
              </div>
            </>
          )}
        </div>

        {/* Bottom Gallery Button - 이미지 미촬영 시만 표시 */}
        {!capturedImage && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-8 pb-12">
            <div className="flex flex-col items-center gap-6">
              <Button
                onClick={handleGallerySelect}
                disabled={isLoading}
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border-4 border-white/30 transition-transform active:scale-95 hover:bg-white/30"
              >
                <img 
                  src="/gallery_icon.png" 
                  alt="갤러리" 
                  className="w-10 h-10 object-contain"
                />
              </Button>
              <p className="text-xl font-medium text-white">갤러리</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}