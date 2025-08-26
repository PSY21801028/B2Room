-- AI 인테리어 디자인용 가구 데이터베이스 테이블
-- Supabase SQL Editor에서 실행하세요

-- 가구 카테고리 테이블
CREATE TABLE IF NOT EXISTS furniture_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 가구 아이템 테이블
CREATE TABLE IF NOT EXISTS furniture_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id INTEGER REFERENCES furniture_categories(id) NOT NULL,
    product_name TEXT NOT NULL,
    brand TEXT,
    price NUMERIC(10,2),
    url TEXT,
    image_url TEXT,
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 가구 속성 테이블 (AI 분석용)
CREATE TABLE IF NOT EXISTS furniture_attributes (
    id SERIAL PRIMARY KEY,
    furniture_id UUID REFERENCES furniture_items(id) NOT NULL,
    mood_keywords TEXT[],
    colors TEXT[],
    materials TEXT[],
    forms TEXT[],
    patterns TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_furniture_items_category_id ON furniture_items(category_id);
CREATE INDEX IF NOT EXISTS idx_furniture_attributes_furniture_id ON furniture_attributes(furniture_id);
CREATE INDEX IF NOT EXISTS idx_furniture_attributes_mood_keywords ON furniture_attributes USING GIN(mood_keywords);

-- RLS 비활성화 (개발용)
ALTER TABLE furniture_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_attributes DISABLE ROW LEVEL SECURITY;

-- 기본 카테고리 데이터 삽입
INSERT INTO furniture_categories (name) VALUES 
('소파'),
('테이블'),
('침대'),
('수납가구'),
('조명'),
('장식소품')
ON CONFLICT (name) DO NOTHING;

-- 샘플 가구 데이터 삽입
INSERT INTO furniture_items (category_id, product_name, brand, price, url, image_url, size) VALUES 
(1, '모던 3인용 소파', '이케아', 299000, 'https://www.ikea.com/kr/ko/', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', '180 x 88 x 66 cm'),
(1, '북유럽 스타일 안락의자', '무인양품', 189000, 'https://www.muji.com', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400', '75 x 85 x 85 cm'),
(2, '원목 커피테이블', '한샘', 149000, 'https://www.hanssem.com', 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400', '120 x 60 x 45 cm'),
(2, '모던 글라스 사이드테이블', '리바트', 89000, 'https://www.livart.co.kr', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', '50 x 50 x 55 cm'),
(3, '퀸사이즈 패브릭 침대', '시몬스', 459000, 'https://www.simmons.co.kr', 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400', '160 x 200 cm'),
(4, '모던 3단 서랍장', '까사미아', 219000, 'https://www.casamia.co.kr', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', '80 x 40 x 120 cm'),
(5, '북유럽 스타일 플로어 스탠드', '일룸', 129000, 'https://www.iloom.co.kr', 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400', '높이 150 cm'),
(6, '모던 패턴 러그', '홈앤리빙', 79000, 'https://homeliving.co.kr', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', '160 x 230 cm');

-- 가구 속성 데이터 삽입 (AI 분석용)
-- furniture_id는 실제 삽입된 가구의 UUID를 사용해야 합니다
-- 아래는 예시이므로 실제 실행 시에는 furniture_items에서 생성된 UUID를 사용하세요
INSERT INTO furniture_attributes (furniture_id, mood_keywords, colors, materials, forms, patterns) VALUES 
((SELECT id FROM furniture_items WHERE product_name = '모던 3인용 소파' LIMIT 1), ARRAY['모던', '심플', '편안함'], ARRAY['베이지', '그레이'], ARRAY['패브릭'], ARRAY['직선형', '각진형태'], ARRAY['무지']),
((SELECT id FROM furniture_items WHERE product_name = '북유럽 스타일 안락의자' LIMIT 1), ARRAY['따뜻함', '자연스러움', '편안함'], ARRAY['우드톤', '화이트'], ARRAY['원목', '패브릭'], ARRAY['곡선형', '둥근형태'], ARRAY['무지']),
((SELECT id FROM furniture_items WHERE product_name = '원목 커피테이블' LIMIT 1), ARRAY['자연스러움', '빈티지', '따뜻함'], ARRAY['브라운', '우드톤'], ARRAY['원목'], ARRAY['직사각형', '단순형태'], ARRAY['나뭇결']),
((SELECT id FROM furniture_items WHERE product_name = '모던 글라스 사이드테이블' LIMIT 1), ARRAY['모던', '세련됨', '깔끔함'], ARRAY['투명', '블랙'], ARRAY['글라스', '메탈'], ARRAY['원형', '심플'], ARRAY['무지']),
((SELECT id FROM furniture_items WHERE product_name = '퀸사이즈 패브릭 침대' LIMIT 1), ARRAY['편안함', '모던', '안락함'], ARRAY['그레이', '네이비'], ARRAY['패브릭', '원목'], ARRAY['직사각형', '부드러움'], ARRAY['무지']),
((SELECT id FROM furniture_items WHERE product_name = '모던 3단 서랍장' LIMIT 1), ARRAY['모던', '깔끔함', '수납'], ARRAY['화이트', '우드톤'], ARRAY['MDF', '원목'], ARRAY['직사각형', '단순'], ARRAY['무지']),
((SELECT id FROM furniture_items WHERE product_name = '북유럽 스타일 플로어 스탠드' LIMIT 1), ARRAY['따뜻함', '자연스러움', '조명'], ARRAY['우드톤', '화이트'], ARRAY['원목', '패브릭'], ARRAY['수직', '원통형'], ARRAY['무지']),
((SELECT id FROM furniture_items WHERE product_name = '모던 패턴 러그' LIMIT 1), ARRAY['모던', '아트', '패턴'], ARRAY['그레이', '베이지'], ARRAY['울', '면'], ARRAY['직사각형'], ARRAY['기하학']);
