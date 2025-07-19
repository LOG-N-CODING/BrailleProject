-- ==================================================
-- Braille Learning Platform - Simple Database Schema
-- Created: 2025-07-17
-- Description: 단순화된 점자 학습 플랫폼 데이터베이스 스키마
-- ==================================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS braille_learning_simple 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE braille_learning_simple;

-- ==================================================
-- 1. 단어 테이블 (Words)
-- ==================================================
CREATE TABLE words (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL COMMENT '카테고리 (예: School & Education, Food & Drink)',
    content VARCHAR(200) NOT NULL COMMENT '단어 내용',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_words_category (category),
    INDEX idx_words_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- 2. 숙어 테이블 (Phrases)
-- ==================================================
CREATE TABLE phrases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL COMMENT '카테고리 (예: Basic, Advanced)',
    content VARCHAR(200) NOT NULL COMMENT '숙어 내용',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phrases_category (category),
    INDEX idx_phrases_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- 3. 학습진행도 테이블 (Learning Progress)
-- ==================================================
CREATE TABLE learning_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL COMMENT '사용자명',
    letters JSON NOT NULL COMMENT '문자 학습 진도 {"A": 0, "B": 0, "C": 1, ...}',
    numbers JSON NOT NULL COMMENT '숫자 학습 진도 {"0": 0, "1": 0, "2": 1, ...}',
    words JSON NOT NULL COMMENT '단어 학습 진도 {"School & Education": {"subject": 0, "homework": 0, ...}}',
    phrases JSON NOT NULL COMMENT '숙어 학습 진도 {"Basic": {"get up": 0, "go to bed": 0, ...}}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_learning_username (username),
    INDEX idx_learning_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- 4. 이미지 퀴즈 테이블 (Image Quiz)
-- ==================================================
CREATE TABLE image_quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL COMMENT '이미지 URL',
    word VARCHAR(100) NOT NULL COMMENT '정답 단어',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_image_quiz_word (word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- 5. 계산 퀴즈 테이블 (Math Quiz)
-- ==================================================
CREATE TABLE math_quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    formula VARCHAR(200) NOT NULL COMMENT '수식',
    answer VARCHAR(50) NOT NULL COMMENT '정답',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy' COMMENT '난이도',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_math_quiz_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- 6. 히스토리 테이블 (Game History)
-- ==================================================
CREATE TABLE game_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL COMMENT '사용자명',
    type ENUM('게임', '스프린트') NOT NULL COMMENT '게임 타입',
    cpm INT NOT NULL DEFAULT 0 COMMENT 'Characters Per Minute',
    combo INT NOT NULL DEFAULT 0 COMMENT '콤보 수',
    score INT NOT NULL DEFAULT 0 COMMENT '점수',
    accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '정확도 (%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_history_username (username),
    INDEX idx_history_type (type),
    INDEX idx_history_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- 7. 뱃지 테이블 (Badges)
-- ==================================================
CREATE TABLE user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL COMMENT '사용자명',
    
    -- Start 뱃지 (3단계)
    start_bronze BOOLEAN DEFAULT FALSE COMMENT 'Start 브론즈 뱃지',
    start_silver BOOLEAN DEFAULT FALSE COMMENT 'Start 실버 뱃지',
    start_gold BOOLEAN DEFAULT FALSE COMMENT 'Start 골드 뱃지',
    
    -- Combo 뱃지 (3단계)
    combo_bronze BOOLEAN DEFAULT FALSE COMMENT 'Combo 브론즈 뱃지',
    combo_silver BOOLEAN DEFAULT FALSE COMMENT 'Combo 실버 뱃지',
    combo_gold BOOLEAN DEFAULT FALSE COMMENT 'Combo 골드 뱃지',
    
    -- Game 뱃지 (3단계)
    game_bronze BOOLEAN DEFAULT FALSE COMMENT 'Game 브론즈 뱃지',
    game_silver BOOLEAN DEFAULT FALSE COMMENT 'Game 실버 뱃지',
    game_gold BOOLEAN DEFAULT FALSE COMMENT 'Game 골드 뱃지',
    
    -- Learn 뱃지 (3단계)
    learn_bronze BOOLEAN DEFAULT FALSE COMMENT 'Learn 브론즈 뱃지',
    learn_silver BOOLEAN DEFAULT FALSE COMMENT 'Learn 실버 뱃지',
    learn_gold BOOLEAN DEFAULT FALSE COMMENT 'Learn 골드 뱃지',
    
    -- Fast 뱃지 (3단계)
    fast_bronze BOOLEAN DEFAULT FALSE COMMENT 'Fast 브론즈 뱃지',
    fast_silver BOOLEAN DEFAULT FALSE COMMENT 'Fast 실버 뱃지',
    fast_gold BOOLEAN DEFAULT FALSE COMMENT 'Fast 골드 뱃지',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_badges_username (username),
    INDEX idx_badges_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- 초기 샘플 데이터 삽입
-- ==================================================

-- 단어 샘플 데이터
INSERT INTO words (category, content) VALUES
('School & Education', 'subject'),
('School & Education', 'homework'),
('School & Education', 'classroom'),
('School & Education', 'teacher'),
('School & Education', 'student'),
('Food & Drink', 'water'),
('Food & Drink', 'coffee'),
('Food & Drink', 'bread'),
('Food & Drink', 'apple'),
('Food & Drink', 'rice'),
('Family', 'mother'),
('Family', 'father'),
('Family', 'sister'),
('Family', 'brother'),
('Family', 'family');

-- 숙어 샘플 데이터
INSERT INTO phrases (category, content) VALUES
('Basic', 'get up'),
('Basic', 'go to bed'),
('Basic', 'take a shower'),
('Basic', 'brush teeth'),
('Basic', 'have breakfast'),
('Daily Life', 'watch TV'),
('Daily Life', 'listen to music'),
('Daily Life', 'read a book'),
('Daily Life', 'play games'),
('Daily Life', 'go shopping'),
('Greetings', 'good morning'),
('Greetings', 'good night'),
('Greetings', 'how are you'),
('Greetings', 'nice to meet you'),
('Greetings', 'see you later');

-- 학습진행도 샘플 데이터
INSERT INTO learning_progress (username, letters, numbers, words, phrases) VALUES
('user001', 
 '{"A": 1, "B": 1, "C": 0, "D": 0, "E": 0, "F": 0, "G": 0, "H": 0, "I": 0, "J": 0, "K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "P": 0, "Q": 0, "R": 0, "S": 0, "T": 0, "U": 0, "V": 0, "W": 0, "X": 0, "Y": 0, "Z": 0}',
 '{"0": 1, "1": 1, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0}',
 '{"School & Education": {"subject": 1, "homework": 0, "classroom": 0}, "Food & Drink": {"water": 1, "coffee": 0, "bread": 0}}',
 '{"Basic": {"get up": 1, "go to bed": 0, "take a shower": 0}, "Daily Life": {"watch TV": 0, "listen to music": 0, "read a book": 0}}'
),
('user002', 
 '{"A": 1, "B": 1, "C": 1, "D": 1, "E": 0, "F": 0, "G": 0, "H": 0, "I": 0, "J": 0, "K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "P": 0, "Q": 0, "R": 0, "S": 0, "T": 0, "U": 0, "V": 0, "W": 0, "X": 0, "Y": 0, "Z": 0}',
 '{"0": 1, "1": 1, "2": 1, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0}',
 '{"School & Education": {"subject": 1, "homework": 1, "classroom": 1}, "Food & Drink": {"water": 1, "coffee": 1, "bread": 0}}',
 '{"Basic": {"get up": 1, "go to bed": 1, "take a shower": 0}, "Greetings": {"good morning": 1, "good night": 0, "how are you": 0}}'
);

-- 이미지 퀴즈 샘플 데이터
INSERT INTO image_quiz (image_url, word) VALUES
('https://example.com/images/apple.jpg', 'apple'),
('https://example.com/images/water.jpg', 'water'),
('https://example.com/images/book.jpg', 'book'),
('https://example.com/images/teacher.jpg', 'teacher'),
('https://example.com/images/family.jpg', 'family');

-- 계산 퀴즈 샘플 데이터
INSERT INTO math_quiz (formula, answer, difficulty) VALUES
('2 + 3', '5', 'easy'),
('7 - 4', '3', 'easy'),
('5 × 6', '30', 'medium'),
('15 ÷ 3', '5', 'medium'),
('12 + 8 - 5', '15', 'hard'),
('(4 + 6) × 2', '20', 'hard');

-- 게임 히스토리 샘플 데이터
INSERT INTO game_history (username, type, cpm, combo, score, accuracy) VALUES
('user001', '게임', 45, 12, 850, 92.5),
('user001', '스프린트', 52, 8, 1200, 88.0),
('user002', '게임', 38, 15, 750, 95.2),
('user002', '스프린트', 41, 10, 980, 91.8),
('user001', '게임', 48, 20, 1150, 94.1);

-- 뱃지 샘플 데이터
INSERT INTO user_badges (username, start_bronze, start_silver, combo_bronze, game_bronze, learn_bronze, fast_bronze) VALUES
('user001', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE),
('user002', TRUE, FALSE, TRUE, FALSE, TRUE, TRUE);

-- ==================================================
-- 유용한 쿼리 예시
-- ==================================================

-- 1. 사용자별 학습 진도 조회
-- SELECT username, 
--        JSON_EXTRACT(letters, '$.A') as letter_A_progress,
--        JSON_EXTRACT(numbers, '$.1') as number_1_progress
-- FROM learning_progress 
-- WHERE username = 'user001';

-- 2. 카테고리별 단어 수 조회
-- SELECT category, COUNT(*) as word_count 
-- FROM words 
-- GROUP BY category;

-- 3. 사용자별 게임 성과 조회
-- SELECT username, 
--        AVG(cpm) as avg_cpm, 
--        MAX(combo) as max_combo, 
--        AVG(accuracy) as avg_accuracy
-- FROM game_history 
-- GROUP BY username;

-- 4. 뱃지 획득 현황 조회
-- SELECT username,
--        (start_bronze + start_silver + start_gold + 
--         combo_bronze + combo_silver + combo_gold +
--         game_bronze + game_silver + game_gold +
--         learn_bronze + learn_silver + learn_gold +
--         fast_bronze + fast_silver + fast_gold) as total_badges
-- FROM user_badges;

-- 5. 퀴즈 난이도별 분포 조회
-- SELECT difficulty, COUNT(*) as quiz_count 
-- FROM math_quiz 
-- GROUP BY difficulty;

-- ==================================================
-- 데이터베이스 스키마 완료
-- ==================================================
