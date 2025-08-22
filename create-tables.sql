-- B2Room 프로젝트용 기본 테이블 생성
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 프로필 정책
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 방 테이블
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_guests INTEGER NOT NULL DEFAULT 1,
    amenities TEXT[],
    image_urls TEXT[],
    host_id UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 활성화
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- 방 정책
CREATE POLICY "Rooms are viewable by everyone" ON rooms
    FOR SELECT USING (true);

CREATE POLICY "Hosts can insert their own rooms" ON rooms
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own rooms" ON rooms
    FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own rooms" ON rooms
    FOR DELETE USING (auth.uid() = host_id);

-- 예약 테이블
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES rooms(id) NOT NULL,
    guest_id UUID REFERENCES profiles(id) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 활성화
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 예약 정책
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = guest_id OR auth.uid() IN (SELECT host_id FROM rooms WHERE id = room_id));

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = guest_id OR auth.uid() IN (SELECT host_id FROM rooms WHERE id = room_id));

-- 리뷰 테이블
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES rooms(id) NOT NULL,
    reviewer_id UUID REFERENCES profiles(id) NOT NULL,
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id) -- 예약 당 하나의 리뷰만
);

-- RLS 정책 활성화
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 리뷰 정책
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their completed bookings" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND 
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_id 
            AND guest_id = auth.uid() 
            AND status = 'completed'
        )
    );

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_reviews_room_id ON reviews(room_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- 샘플 데이터 삽입 (선택사항)
-- 테스트용 프로필 (실제 auth.users가 있어야 함)
-- INSERT INTO profiles (id, username, full_name) 
-- VALUES 
--   ('11111111-1111-1111-1111-111111111111', 'testuser1', 'Test User 1'),
--   ('22222222-2222-2222-2222-222222222222', 'testuser2', 'Test User 2');

-- 테스트용 방
-- INSERT INTO rooms (title, description, price_per_night, max_guests, host_id) 
-- VALUES 
--   ('아늑한 스튜디오', '도심 속 편안한 공간', 50000, 2, '11111111-1111-1111-1111-111111111111'),
--   ('모던 아파트', '최신 시설의 아파트', 80000, 4, '22222222-2222-2222-2222-222222222222');
