export interface UploadImageRequest {
  imageFile: File;
}

export interface AnalysisMetadata {
  processingTime: number;
  timestamp: string;
  imageInfo: {
    name: string;
    size: number;
    type: string;
  };
}

export interface UploadImageResponse {
  success: boolean;
  data?: {
    analysis: any;
    metadata: AnalysisMetadata;
  };
  message: string;
  error?: string;
  code?: string;
  details?: string;
  processingTime?: number;
}

/**
 * 이미지를 FastAPI 서버로 업로드하고 분석을 요청합니다.
 * @param imageFile - 업로드할 이미지 파일
 * @returns 분석 결과
 */
export async function uploadImageToAnalyze(imageFile: File): Promise<UploadImageResponse> {
  try {
    console.log('[클라이언트] 이미지 분석 시작:', {
      name: imageFile.name,
      size: `${(imageFile.size / 1024).toFixed(1)}KB`,
      type: imageFile.type
    });

    // 클라이언트 측 파일 검증
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (imageFile.size > maxSize) {
      return {
        success: false,
        message: `파일 크기가 너무 큽니다. 최대 ${maxSize / 1024 / 1024}MB까지 허용됩니다.`,
        error: '파일 크기 초과',
        code: 'FILE_TOO_LARGE'
      };
    }

    if (!allowedTypes.includes(imageFile.type)) {
      return {
        success: false,
        message: '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 지원)',
        error: '지원하지 않는 파일 형식',
        code: 'INVALID_FILE_TYPE'
      };
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const startTime = Date.now();
    
    // 타임아웃 설정 (5초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const result = await response.json();
    const clientProcessingTime = Date.now() - startTime;
    
    if (!response.ok) {
      console.error('[클라이언트] API 오류:', result);
      throw new Error(result.error || '이미지 분석 중 오류가 발생했습니다.');
    }

    console.log('[클라이언트] 분석 완료:', {
      success: result.success,
      processingTime: `${clientProcessingTime}ms`,
      serverProcessingTime: result.data?.metadata?.processingTime ? `${result.data.metadata.processingTime}ms` : 'unknown'
    });

    return result;

  } catch (error) {
    console.error('[클라이언트] 이미지 분석 오류:', error);
    
    // 타임아웃 오류 감지
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: '서버 응답 시간이 초과되었습니다.',
        error: '타임아웃 오류',
        code: 'TIMEOUT'
      };
    }
    
    // 네트워크 오류 감지
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: '네트워크 연결을 확인해주세요.',
        error: '네트워크 오류',
        code: 'NETWORK_ERROR'
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      code: 'CLIENT_ERROR'
    };
  }
}

/**
 * Base64 이미지 데이터를 File 객체로 변환합니다.
 * @param base64Data - Base64 이미지 데이터
 * @param fileName - 파일명 (기본값: image.jpg)
 * @returns File 객체
 */
export function base64ToFile(base64Data: string, fileName: string = 'captured-image.jpg'): File {
  // data:image/jpeg;base64, 부분 제거
  const base64 = base64Data.split(',')[1];
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  
  return new File([blob], fileName, { type: 'image/jpeg' });
}
