-- =============================================================================
-- Braille Learning Platform Database Schema
-- Project: Braille Input Device and Web Content for Learning
-- Student: 안진우
-- =============================================================================

-- Users 테이블 - 사용자 정보 관리
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    profile_image_url VARCHAR(500),
    role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
    school_name VARCHAR(100),
    grade_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Learning Stages 테이블 - 학습 단계 정의
CREATE TABLE learning_stages (
    stage_id INT AUTO_INCREMENT PRIMARY KEY,
    stage_type ENUM('alphabet', 'number', 'practice') NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_level INT DEFAULT 1,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Learning Progress 테이블 - 사용자별 학습 진도 추적
CREATE TABLE user_learning_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    stage_id INT NOT NULL,
    character_target VARCHAR(10), -- A-Z, 0-9, or special characters
    mastery_level ENUM('beginner', 'intermediate', 'advanced', 'mastered') DEFAULT 'beginner',
    attempts_count INT DEFAULT 0,
    correct_attempts INT DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
    best_time_ms INT, -- 최고 입력 시간 (밀리초)
    last_practice_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES learning_stages(stage_id),
    UNIQUE KEY unique_user_stage_character (user_id, stage_id, character_target)
);

-- Quiz Categories 테이블 - 퀴즈 카테고리
CREATE TABLE quiz_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_type ENUM('image_to_braille', 'math_quiz', 'general') NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Questions 테이블 - 퀴즈 문제
CREATE TABLE quiz_questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_image_url VARCHAR(500),
    correct_answer VARCHAR(200) NOT NULL,
    braille_answer VARCHAR(200), -- 점자 표현
    difficulty_level INT DEFAULT 1,
    question_type ENUM('text', 'image', 'math') DEFAULT 'text',
    hints TEXT,
    explanation TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES quiz_categories(category_id)
);

-- Quiz Sessions 테이블 - 퀴즈 세션 관리
CREATE TABLE quiz_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    category_id INT NOT NULL,
    session_type ENUM('practice', 'timed', 'challenge') DEFAULT 'practice',
    total_questions INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    total_score INT DEFAULT 0,
    time_taken_seconds INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES quiz_categories(category_id)
);

-- Quiz Answers 테이블 - 퀴즈 답안 기록
CREATE TABLE quiz_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answer VARCHAR(200),
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken_seconds INT DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(question_id)
);

-- Games 테이블 - 게임 정의
CREATE TABLE games (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    game_type ENUM('typing_game', 'typing_sprint', 'memory_game', 'word_guessing') NOT NULL,
    description TEXT,
    difficulty_levels JSON, -- 난이도별 설정 저장
    scoring_rules JSON, -- 점수 계산 규칙
    time_limit_seconds INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Sessions 테이블 - 게임 세션 기록
CREATE TABLE game_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    game_id INT NOT NULL,
    difficulty_level INT DEFAULT 1,
    score INT DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
    time_taken_seconds INT DEFAULT 0,
    characters_typed INT DEFAULT 0,
    errors_count INT DEFAULT 0,
    wpm DECIMAL(5,2) DEFAULT 0.00, -- Words Per Minute
    session_data JSON, -- 세션별 상세 데이터
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

-- Badges 테이블 - 배지 정의
CREATE TABLE badges (
    badge_id INT AUTO_INCREMENT PRIMARY KEY,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_icon_url VARCHAR(500),
    badge_type ENUM('learning', 'achievement', 'streak', 'special') DEFAULT 'achievement',
    unlock_condition JSON, -- 해금 조건 (JSON 형태로 복잡한 조건 저장)
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    points_reward INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Badges 테이블 - 사용자별 배지 획득 기록
CREATE TABLE user_badges (
    user_badge_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_data JSON, -- 배지 획득 과정 데이터
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(badge_id),
    UNIQUE KEY unique_user_badge (user_id, badge_id)
);

-- Leaderboards 테이블 - 리더보드 관리
CREATE TABLE leaderboards (
    leaderboard_id INT AUTO_INCREMENT PRIMARY KEY,
    leaderboard_name VARCHAR(100) NOT NULL,
    leaderboard_type ENUM('overall', 'weekly', 'monthly', 'game_specific', 'quiz_specific') NOT NULL,
    calculation_method ENUM('total_score', 'accuracy', 'speed', 'streak') DEFAULT 'total_score',
    reset_frequency ENUM('never', 'daily', 'weekly', 'monthly') DEFAULT 'never',
    last_reset_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard Entries 테이블 - 리더보드 엔트리
CREATE TABLE leaderboard_entries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    leaderboard_id INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    score DECIMAL(10,2) NOT NULL,
    rank_position INT,
    additional_stats JSON, -- 추가 통계 정보
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leaderboard_id) REFERENCES leaderboards(leaderboard_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_leaderboard_user (leaderboard_id, user_id)
);

-- Forum Categories 테이블 - 포럼 카테고리
CREATE TABLE forum_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Posts 테이블 - 포럼 게시글
CREATE TABLE forum_posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES forum_categories(category_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Forum Replies 테이블 - 포럼 댓글
CREATE TABLE forum_replies (
    reply_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    parent_reply_id INT, -- 대댓글용
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES forum_replies(reply_id) ON DELETE CASCADE
);

-- Learning Resources 테이블 - 학습 자료
CREATE TABLE learning_resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    resource_type ENUM('ebook', 'worksheet', 'reference', 'article', 'video') NOT NULL,
    file_url VARCHAR(500),
    file_size INT, -- bytes
    download_count INT DEFAULT 0,
    grade_level VARCHAR(20),
    subject_tags JSON, -- 주제 태그들
    is_free BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);

-- Device Sessions 테이블 - 점자 입력 장치 세션
CREATE TABLE device_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    device_id VARCHAR(100), -- 장치 식별자
    session_type ENUM('practice', 'learning', 'game', 'quiz') NOT NULL,
    input_data JSON, -- 입력된 점자 데이터
    accuracy_stats JSON, -- 정확도 통계
    session_duration_seconds INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User Activity Log 테이블 - 사용자 활동 로그
CREATE TABLE user_activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    activity_type ENUM('login', 'logout', 'learning', 'quiz', 'game', 'forum', 'resource_download') NOT NULL,
    activity_details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- System Settings 테이블 - 시스템 설정
CREATE TABLE system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

-- =============================================================================
-- 인덱스 생성
-- =============================================================================

-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_user_learning_progress_user_stage ON user_learning_progress(user_id, stage_id);
CREATE INDEX idx_quiz_sessions_user_category ON quiz_sessions(user_id, category_id);
CREATE INDEX idx_game_sessions_user_game ON game_sessions(user_id, game_id);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(leaderboard_id, rank_position);
CREATE INDEX idx_forum_posts_category_created ON forum_posts(category_id, created_at);
CREATE INDEX idx_user_activity_log_user_created ON user_activity_log(user_id, created_at);

-- =============================================================================
-- 초기 데이터 삽입
-- =============================================================================

-- Learning Stages 초기 데이터
INSERT INTO learning_stages (stage_type, stage_name, description, difficulty_level, sort_order) VALUES
('alphabet', 'Alphabet Learning', 'Learn Braille alphabet A-Z', 1, 1),
('number', 'Number Learning', 'Learn Braille numbers 0-9', 1, 2),
('practice', 'Practice Mode', 'Free practice with feedback', 2, 3);

-- Quiz Categories 초기 데이터
INSERT INTO quiz_categories (category_name, category_type, description) VALUES
('Image to Braille', 'image_to_braille', 'Identify images and input corresponding Braille'),
('Math Quiz', 'math_quiz', 'Solve arithmetic problems using Braille numbers'),
('General Knowledge', 'general', 'General Braille knowledge quiz');

-- Games 초기 데이터
INSERT INTO games (game_name, game_type, description) VALUES
('Typing Game', 'typing_game', 'Practice typing Braille characters quickly'),
('Typing Sprint', 'typing_sprint', 'Type as many correct characters as possible in time limit'),
('Memory Game', 'memory_game', 'Match Braille characters with their meanings'),
('Word Guessing', 'word_guessing', 'Guess words from Braille patterns');

-- Badges 초기 데이터
INSERT INTO badges (badge_name, badge_description, badge_type, unlock_condition, points_reward) VALUES
('First Steps', 'Complete your first learning session', 'learning', '{"type": "first_session"}', 10),
('Alphabet Master', 'Master all alphabet characters', 'achievement', '{"type": "mastery", "category": "alphabet"}', 100),
('Speed Demon', 'Type 30 WPM in typing game', 'achievement', '{"type": "speed", "threshold": 30}', 50),
('Perfect Score', 'Get 100% accuracy in any quiz', 'achievement', '{"type": "accuracy", "threshold": 100}', 75);

-- Leaderboards 초기 데이터
INSERT INTO leaderboards (leaderboard_name, leaderboard_type, calculation_method) VALUES
('Overall Champions', 'overall', 'total_score'),
('Weekly Heroes', 'weekly', 'total_score'),
('Speed Masters', 'overall', 'speed'),
('Accuracy Experts', 'overall', 'accuracy');

-- Forum Categories 초기 데이터
INSERT INTO forum_categories (category_name, description, sort_order) VALUES
('General Discussion', 'General discussions about Braille learning', 1),
('Learning Tips', 'Share and discuss learning strategies', 2),
('Technical Support', 'Get help with technical issues', 3),
('Success Stories', 'Share your learning achievements', 4);

-- System Settings 초기 데이터
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'BraillePlay', 'string', 'Application name', true),
('max_session_duration', '3600', 'number', 'Maximum session duration in seconds', false),
('enable_leaderboards', 'true', 'boolean', 'Enable leaderboard features', true),
('default_difficulty', '1', 'number', 'Default difficulty level for new users', true);
