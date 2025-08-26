import { NextRequest, NextResponse } from 'next/server';

// 환경변수에서 설정 로드 (fallback 값 포함)
const FASTAPI_SERVER_URL = process.env.FASTAPI_SERVER_URL || 'http://141.223.108.122:8000';
const FASTAPI_USERNAME = process.env.FASTAPI_USERNAME || 'admin';
const FASTAPI_PASSWORD = process.env.FASTAPI_PASSWORD || 'cjdsusBig';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// 설정 로그
console.log('[API] FastAPI 서버 설정:', {
  url: FASTAPI_SERVER_URL,
  hasAuth: !!(FASTAPI_USERNAME && FASTAPI_PASSWORD)
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {

    console.log('[API] 이미지 분석 요청 시작');
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    // 파일 존재 검증
    if (!imageFile) {
      return NextResponse.json(
        { 
          error: '이미지 파일이 제공되지 않았습니다.',
          code: 'NO_FILE' 
        },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 허용됩니다.`,
          code: 'FILE_TOO_LARGE',
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { 
          error: '지원하지 않는 파일 형식입니다.',
          code: 'INVALID_FILE_TYPE',
          allowedTypes: ALLOWED_TYPES
        },
        { status: 400 }
      );
    }

    console.log('[API] 파일 검증 완료:', {
      name: imageFile.name,
      size: `${(imageFile.size / 1024).toFixed(1)}KB`,
      type: imageFile.type
    });

    // FastAPI 서버로 전송할 FormData 생성
    const apiFormData = new FormData();
    apiFormData.append('file', imageFile, imageFile.name);

    console.log('[API] FastAPI 서버로 전송 시작:', FASTAPI_SERVER_URL);

    // 인증 헤더 생성
    const headers: Record<string, string> = {};
    if (FASTAPI_USERNAME && FASTAPI_PASSWORD) {
      headers['Authorization'] = `Basic ${Buffer.from(`${FASTAPI_USERNAME}:${FASTAPI_PASSWORD}`).toString('base64')}`;
    }

    // FastAPI 서버로 이미지 전송 (타임아웃 설정)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

    const response = await fetch(`${FASTAPI_SERVER_URL}/predict`, {
      method: 'POST',
      body: apiFormData,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 응답 검증
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] FastAPI 서버 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // 구체적인 오류 코드에 따른 처리
      const errorCode = response.status === 401 ? 'UNAUTHORIZED' :
                       response.status === 403 ? 'FORBIDDEN' :
                       response.status === 413 ? 'PAYLOAD_TOO_LARGE' :
                       response.status === 429 ? 'TOO_MANY_REQUESTS' :
                       'SERVER_ERROR';
      
      return NextResponse.json(
        { 
          error: 'AI 분석 서버에서 오류가 발생했습니다.',
          code: errorCode,
          status: response.status,
          details: process.env.NODE_ENV === 'development' ? errorText : undefined
        },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    // 응답 파싱
    const result = await response.json();
    const processingTime = Date.now() - startTime;
    
    console.log('[API] 분석 완료:', {
      processingTime: `${processingTime}ms`,
      resultKeys: Object.keys(result)
    });
    
    // 표준화된 응답 구조
    return NextResponse.json({
      success: true,
      data: {
        analysis: result,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          imageInfo: {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type
          }
        }
      },
      message: '이미지 분석이 완료되었습니다.'
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // 타임아웃 오류 처리
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[API] 요청 타임아웃');
      return NextResponse.json(
        { 
          error: '분석 요청이 시간 초과되었습니다.',
          code: 'TIMEOUT',
          processingTime
        },
        { status: 408 }
      );
    }

    // 네트워크 오류 처리
    if (error instanceof Error && error.message.includes('fetch')) {
      console.error('[API] 네트워크 오류:', error.message);
      return NextResponse.json(
        { 
          error: 'AI 분석 서버에 연결할 수 없습니다.',
          code: 'NETWORK_ERROR',
          processingTime
        },
        { status: 503 }
      );
    }

    console.error('[API] 예상치 못한 오류:', error);
    
    return NextResponse.json(
      { 
        error: '서버에서 오류가 발생했습니다.',
        code: 'INTERNAL_ERROR',
        processingTime,
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
