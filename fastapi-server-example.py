"""
FastAPI 서버 예시 코드
이 코드를 별도 서버에서 실행하세요.

설치 필요:
pip install fastapi uvicorn python-multipart pillow

실행 방법:
uvicorn fastapi-server-example:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import base64
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="B2Room Image Analysis API", version="1.0.0")

# CORS 설정 (Next.js에서 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 구체적인 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "B2Room FastAPI Server is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "B2Room Image Analysis"}

@app.post("/analyze")
async def analyze_room_image(image: UploadFile = File(...)):
    """
    방 이미지를 분석하는 엔드포인트 (/analyze)
    """
    try:
        logger.info(f"이미지 분석 요청 받음: {image.filename}")
        
        # 이미지 파일 검증
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
        
        # 이미지 데이터 읽기
        image_data = await image.read()
        logger.info(f"이미지 크기: {len(image_data)} bytes")
        
        # PIL로 이미지 열기 (검증)
        try:
            pil_image = Image.open(io.BytesIO(image_data))
            width, height = pil_image.size
            logger.info(f"이미지 해상도: {width}x{height}")
        except Exception as e:
            raise HTTPException(status_code=400, detail="유효하지 않은 이미지 파일입니다.")
        
        # 여기에 실제 AI 분석 로직을 구현하세요
        # 예시 분석 결과
        analysis_result = {
            "image_info": {
                "filename": image.filename,
                "size": len(image_data),
                "dimensions": f"{width}x{height}",
                "format": pil_image.format
            },
            "room_analysis": {
                "room_type": "living_room",  # AI로 감지된 방 타입
                "furniture_detected": [
                    {"type": "sofa", "confidence": 0.95, "bbox": [100, 200, 300, 400]},
                    {"type": "table", "confidence": 0.87, "bbox": [200, 300, 400, 450]},
                    {"type": "tv", "confidence": 0.91, "bbox": [50, 100, 250, 200]}
                ],
                "color_scheme": "warm_brown",
                "lighting": "natural",
                "style_detected": "modern"
            },
            "recommendations": [
                {
                    "furniture_type": "chair",
                    "reason": "소파와 조화를 이루는 의자 추천",
                    "priority": "high"
                },
                {
                    "furniture_type": "lamp",
                    "reason": "조명 개선을 위한 스탠드 조명",
                    "priority": "medium"
                }
            ],
            "processing_time": "2.5s",
            "analysis_id": f"analysis_{hash(image_data) % 10000}"
        }
        
        logger.info("이미지 분석 완료")
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"이미지 분석 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분석 중 오류가 발생했습니다: {str(e)}")

@app.post("/test-connection")
async def test_connection():
    """
    연결 테스트용 엔드포인트
    """
    return {
        "status": "success",
        "message": "FastAPI 서버 연결이 정상입니다!",
        "timestamp": "2024-01-01T00:00:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
