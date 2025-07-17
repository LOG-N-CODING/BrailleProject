-- =============================================================================
-- Braille Learning Platform - Sample Data
-- =============================================================================

-- 샘플 사용자 데이터
INSERT INTO users (user_id, email, username, password_hash, display_name, role, school_name, grade_level) VALUES
('user_001', 'student1@example.com', 'student1', '$2b$12$sample_hash_1', 'Alice Johnson', 'student', 'Seoul Elementary', 'Grade 4'),
('user_002', 'student2@example.com', 'student2', '$2b$12$sample_hash_2', 'Bob Smith', 'student', 'Busan Middle School', 'Grade 7'),
('user_003', 'teacher1@example.com', 'teacher1', '$2b$12$sample_hash_3', 'Carol Davis', 'teacher', 'Seoul Elementary', 'Teacher'),
('user_004', 'student3@example.com', 'student3', '$2b$12$sample_hash_4', 'David Lee', 'student', 'Daegu High School', 'Grade 10'),
('user_005', 'student4@example.com', 'student4', '$2b$12$sample_hash_5', 'Emma Wilson', 'student', 'Incheon Elementary', 'Grade 5');

-- 샘플 퀴즈 문제 데이터
INSERT INTO quiz_questions (category_id, question_text, question_image_url, correct_answer, braille_answer, difficulty_level, question_type) VALUES
(1, 'What is shown in this image?', 'https://example.com/images/apple.jpg', 'apple', '⠁⠏⠏⠇⠑', 1, 'image'),
(1, 'Identify this object', 'https://example.com/images/book.jpg', 'book', '⠃⠕⠕⠅', 1, 'image'),
(1, 'What animal is this?', 'https://example.com/images/cat.jpg', 'cat', '⠉⠁⠞', 1, 'image'),
(2, 'What is 3 + 5?', NULL, '8', '⠼⠓', 1, 'math'),
(2, 'Calculate 12 - 7', NULL, '5', '⠼⠑', 1, 'math'),
(2, 'What is 4 × 2?', NULL, '8', '⠼⠓', 2, 'math'),
(3, 'How many dots are in a Braille cell?', NULL, '6', '⠼⠋', 1, 'text'),
(3, 'Who invented Braille?', NULL, 'Louis Braille', '⠇⠕⠥⠊⠎ ⠃⠗⠁⠊⠇⠇⠑', 2, 'text');

-- 샘플 학습 진도 데이터
INSERT INTO user_learning_progress (user_id, stage_id, character_target, mastery_level, attempts_count, correct_attempts, accuracy_rate, best_time_ms, last_practice_at) VALUES
('user_001', 1, 'A', 'mastered', 15, 14, 93.33, 1200, '2024-01-15 10:30:00'),
('user_001', 1, 'B', 'advanced', 10, 8, 80.00, 1500, '2024-01-15 10:35:00'),
('user_001', 1, 'C', 'intermediate', 8, 5, 62.50, 2000, '2024-01-15 10:40:00'),
('user_001', 2, '1', 'mastered', 12, 12, 100.00, 1000, '2024-01-15 11:00:00'),
('user_001', 2, '2', 'advanced', 8, 7, 87.50, 1100, '2024-01-15 11:05:00'),
('user_002', 1, 'A', 'advanced', 12, 9, 75.00, 1800, '2024-01-16 14:20:00'),
('user_002', 1, 'B', 'intermediate', 6, 4, 66.67, 2200, '2024-01-16 14:25:00'),
('user_002', 2, '1', 'advanced', 10, 8, 80.00, 1600, '2024-01-16 15:00:00');

-- 샘플 게임 세션 데이터
INSERT INTO game_sessions (user_id, game_id, difficulty_level, score, accuracy_rate, time_taken_seconds, characters_typed, errors_count, wpm, is_completed, started_at, completed_at) VALUES
('user_001', 1, 1, 850, 92.5, 120, 100, 8, 25.5, TRUE, '2024-01-15 09:00:00', '2024-01-15 09:02:00'),
('user_001', 1, 2, 1200, 88.0, 150, 120, 14, 28.8, TRUE, '2024-01-15 09:30:00', '2024-01-15 09:32:30'),
('user_001', 2, 1, 750, 95.0, 60, 80, 4, 32.0, TRUE, '2024-01-15 10:00:00', '2024-01-15 10:01:00'),
('user_002', 1, 1, 650, 85.0, 140, 90, 13, 20.1, TRUE, '2024-01-16 13:00:00', '2024-01-16 13:02:20'),
('user_002', 2, 1, 600, 90.0, 70, 75, 7, 25.7, TRUE, '2024-01-16 13:30:00', '2024-01-16 13:31:10');

-- 샘플 퀴즈 세션 데이터
INSERT INTO quiz_sessions (user_id, category_id, session_type, total_questions, correct_answers, total_score, time_taken_seconds, is_completed, started_at, completed_at) VALUES
('user_001', 1, 'practice', 5, 4, 400, 300, TRUE, '2024-01-15 11:30:00', '2024-01-15 11:35:00'),
('user_001', 2, 'practice', 3, 3, 300, 180, TRUE, '2024-01-15 12:00:00', '2024-01-15 12:03:00'),
('user_001', 3, 'timed', 4, 3, 300, 240, TRUE, '2024-01-15 12:30:00', '2024-01-15 12:34:00'),
('user_002', 1, 'practice', 5, 3, 300, 400, TRUE, '2024-01-16 16:00:00', '2024-01-16 16:06:40'),
('user_002', 2, 'practice', 3, 2, 200, 220, TRUE, '2024-01-16 16:30:00', '2024-01-16 16:33:40');

-- 샘플 배지 획득 데이터
INSERT INTO user_badges (user_id, badge_id, progress_data) VALUES
('user_001', 1, '{"session_type": "learning", "completed_at": "2024-01-15T10:30:00Z"}'),
('user_001', 2, '{"mastered_count": 26, "completion_date": "2024-01-15T12:00:00Z"}'),
('user_001', 3, '{"max_wpm": 32.0, "achieved_at": "2024-01-15T10:01:00Z"}'),
('user_001', 4, '{"quiz_session_id": 2, "accuracy": 100.0, "achieved_at": "2024-01-15T12:03:00Z"}'),
('user_002', 1, '{"session_type": "learning", "completed_at": "2024-01-16T14:20:00Z"}'),
('user_002', 3, '{"max_wpm": 25.7, "achieved_at": "2024-01-16T13:31:10Z"}');

-- 샘플 리더보드 엔트리 데이터
INSERT INTO leaderboard_entries (leaderboard_id, user_id, score, rank_position, additional_stats) VALUES
(1, 'user_001', 2500.00, 1, '{"total_sessions": 15, "avg_accuracy": 91.5, "badges_earned": 4}'),
(1, 'user_002', 1800.00, 2, '{"total_sessions": 12, "avg_accuracy": 85.2, "badges_earned": 2}'),
(1, 'user_004', 1200.00, 3, '{"total_sessions": 8, "avg_accuracy": 78.5, "badges_earned": 1}'),
(1, 'user_005', 800.00, 4, '{"total_sessions": 5, "avg_accuracy": 82.0, "badges_earned": 1}'),
(2, 'user_001', 2500.00, 1, '{"weekly_sessions": 8, "weekly_accuracy": 92.0}'),
(2, 'user_002', 1200.00, 2, '{"weekly_sessions": 6, "weekly_accuracy": 86.5}'),
(3, 'user_001', 32.0, 1, '{"best_game": "typing_sprint", "session_id": 3}'),
(3, 'user_002', 25.7, 2, '{"best_game": "typing_sprint", "session_id": 5}'),
(4, 'user_001', 91.5, 1, '{"best_quiz": "math_quiz", "session_id": 2}'),
(4, 'user_002', 85.2, 2, '{"best_quiz": "image_to_braille", "session_id": 4}');

-- 샘플 포럼 게시글 데이터
INSERT INTO forum_posts (category_id, user_id, title, content, view_count, like_count) VALUES
(1, 'user_001', 'Welcome to Braille Learning!', 'Hi everyone! I\'m excited to start learning Braille with this amazing platform. The interactive device makes it so much easier to understand the dot patterns!', 25, 8),
(2, 'user_002', 'Tips for memorizing Braille alphabet', 'I found that practicing with songs helps me remember the patterns better. Does anyone have other creative memorization techniques?', 18, 5),
(1, 'user_004', 'Device connection issues', 'I\'m having trouble connecting my Braille input device. It shows as connected but doesn\'t register my inputs. Any solutions?', 12, 2),
(4, 'user_001', 'Achieved my first perfect score!', 'Just got 100% accuracy on the math quiz! The key was taking time to double-check each Braille number before submitting.', 30, 12);

-- 샘플 포럼 댓글 데이터
INSERT INTO forum_replies (post_id, user_id, content, like_count) VALUES
(1, 'user_002', 'Welcome! I agree, the tactile feedback really helps with learning. Good luck with your Braille journey!', 3),
(1, 'user_003', 'That\'s wonderful to hear! Don\'t hesitate to ask if you need any help or have questions about the curriculum.', 5),
(2, 'user_001', 'Great tip about songs! I also like to practice writing in the air with my finger to reinforce the patterns.', 4),
(2, 'user_005', 'I create little stories for each letter. For example, \'A\' has one dot like a single apple!', 6),
(3, 'user_003', 'Try checking the USB connection and make sure the device drivers are properly installed. Also, restart the browser after connecting.', 8),
(4, 'user_002', 'Congratulations! That\'s amazing progress. The math quiz was challenging for me too.', 2),
(4, 'user_005', 'Wow, inspiring! I\'m still working on getting my accuracy up. Any specific practice routine you recommend?', 1);

-- 샘플 학습 자료 데이터
INSERT INTO learning_resources (title, description, resource_type, file_url, file_size, download_count, grade_level, subject_tags, uploaded_by) VALUES
('Braille Alphabet Quick Reference', 'A handy reference card showing all Braille letters with their dot patterns', 'reference', 'https://example.com/resources/braille_alphabet_ref.pdf', 245760, 156, 'All Grades', '["alphabet", "reference", "beginner"]', 'user_003'),
('Basic Braille Numbers Worksheet', 'Practice worksheet for learning Braille numbers 0-9', 'worksheet', 'https://example.com/resources/braille_numbers_worksheet.pdf', 180224, 89, 'Grade 3-6', '["numbers", "worksheet", "practice"]', 'user_003'),
('History of Braille - Interactive eBook', 'Learn about Louis Braille and the development of the Braille system', 'ebook', 'https://example.com/resources/braille_history.epub', 1024000, 67, 'Grade 5+', '["history", "biography", "educational"]', 'user_003'),
('Braille Punctuation Guide', 'Complete guide to Braille punctuation marks and symbols', 'reference', 'https://example.com/resources/braille_punctuation.pdf', 156672, 43, 'Grade 4+', '["punctuation", "symbols", "advanced"]', 'user_003');

-- 샘플 장치 세션 데이터
INSERT INTO device_sessions (user_id, device_id, session_type, input_data, accuracy_stats, session_duration_seconds, started_at, ended_at) VALUES
('user_001', 'device_001', 'learning', 
 '{"characters": ["A", "B", "C"], "patterns": [[1], [1,2], [1,4]], "timestamps": ["2024-01-15T10:30:00Z", "2024-01-15T10:30:05Z", "2024-01-15T10:30:10Z"]}',
 '{"total_attempts": 3, "correct_attempts": 3, "accuracy": 100.0, "avg_time_ms": 1200}',
 600, '2024-01-15 10:30:00', '2024-01-15 10:40:00'),
('user_001', 'device_001', 'practice', 
 '{"characters": ["1", "2", "3"], "patterns": [[1], [1,2], [1,4]], "timestamps": ["2024-01-15T11:00:00Z", "2024-01-15T11:00:03Z", "2024-01-15T11:00:06Z"]}',
 '{"total_attempts": 3, "correct_attempts": 3, "accuracy": 100.0, "avg_time_ms": 1000}',
 300, '2024-01-15 11:00:00', '2024-01-15 11:05:00'),
('user_002', 'device_002', 'learning', 
 '{"characters": ["A", "B"], "patterns": [[1], [1,2]], "timestamps": ["2024-01-16T14:20:00Z", "2024-01-16T14:20:06Z"]}',
 '{"total_attempts": 2, "correct_attempts": 2, "accuracy": 100.0, "avg_time_ms": 1800}',
 480, '2024-01-16 14:20:00', '2024-01-16 14:28:00');

-- 샘플 활동 로그 데이터
INSERT INTO user_activity_log (user_id, activity_type, activity_details, ip_address, user_agent) VALUES
('user_001', 'login', '{"login_method": "email", "success": true}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('user_001', 'learning', '{"stage": "alphabet", "character": "A", "result": "success"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('user_001', 'game', '{"game_type": "typing_game", "score": 850, "difficulty": 1}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('user_001', 'quiz', '{"category": "math_quiz", "score": 300, "accuracy": 100}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('user_002', 'login', '{"login_method": "email", "success": true}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('user_002', 'learning', '{"stage": "alphabet", "character": "A", "result": "success"}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('user_002', 'forum', '{"action": "create_post", "post_id": 2, "category": "learning_tips"}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

-- 샘플 퀴즈 답안 데이터
INSERT INTO quiz_answers (session_id, question_id, user_answer, is_correct, time_taken_seconds) VALUES
-- user_001의 첫 번째 퀴즈 세션
(1, 1, 'apple', TRUE, 45),
(1, 2, 'book', TRUE, 38),
(1, 3, 'cat', TRUE, 42),
(1, 4, 'dog', FALSE, 55), -- 잘못된 답
(1, 5, 'elephant', TRUE, 68),
-- user_001의 두 번째 퀴즈 세션 (수학)
(2, 4, '8', TRUE, 25),
(2, 5, '5', TRUE, 30),
(2, 6, '8', TRUE, 35),
-- user_002의 첫 번째 퀴즈 세션
(4, 1, 'apple', TRUE, 52),
(4, 2, 'book', TRUE, 48),
(4, 3, 'dog', FALSE, 65), -- 잘못된 답 (정답: cat)
(4, 4, 'tree', FALSE, 70), -- 잘못된 답
(4, 5, 'house', FALSE, 75); -- 잘못된 답

-- 현재 시간으로 last_login_at 업데이트
UPDATE users SET last_login_at = NOW() WHERE user_id IN ('user_001', 'user_002');

-- 추가 시스템 설정
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false),
('max_quiz_attempts', '3', 'number', 'Maximum quiz attempts per day', true),
('enable_sound_effects', 'true', 'boolean', 'Enable sound effects in games', true),
('session_timeout_minutes', '30', 'number', 'Session timeout in minutes', false),
('min_accuracy_for_mastery', '90', 'number', 'Minimum accuracy percentage for mastery level', true),
('points_per_correct_answer', '10', 'number', 'Points awarded for each correct answer', true),
('daily_streak_bonus', '50', 'number', 'Bonus points for daily practice streak', true);

-- =============================================================================
-- 데이터 검증 쿼리
-- =============================================================================

-- 사용자별 통계 요약
SELECT 
    u.username,
    u.display_name,
    COUNT(DISTINCT ulp.stage_id) as learning_stages,
    COUNT(DISTINCT gs.session_id) as game_sessions,
    COUNT(DISTINCT qs.session_id) as quiz_sessions,
    COUNT(DISTINCT ub.badge_id) as badges_earned,
    AVG(ulp.accuracy_rate) as avg_accuracy
FROM users u
LEFT JOIN user_learning_progress ulp ON u.user_id = ulp.user_id
LEFT JOIN game_sessions gs ON u.user_id = gs.user_id AND gs.is_completed = TRUE
LEFT JOIN quiz_sessions qs ON u.user_id = qs.user_id AND qs.is_completed = TRUE
LEFT JOIN user_badges ub ON u.user_id = ub.user_id
WHERE u.role = 'student'
GROUP BY u.user_id, u.username, u.display_name
ORDER BY badges_earned DESC, avg_accuracy DESC;

-- 인기 있는 게임 순위
SELECT 
    g.game_name,
    COUNT(gs.session_id) as total_sessions,
    AVG(gs.score) as avg_score,
    AVG(gs.accuracy_rate) as avg_accuracy,
    AVG(gs.wpm) as avg_wpm
FROM games g
LEFT JOIN game_sessions gs ON g.game_id = gs.game_id AND gs.is_completed = TRUE
GROUP BY g.game_id, g.game_name
ORDER BY total_sessions DESC;

-- 퀴즈 카테고리별 성과
SELECT 
    qc.category_name,
    COUNT(qs.session_id) as total_sessions,
    AVG(qs.correct_answers * 100.0 / qs.total_questions) as avg_accuracy,
    AVG(qs.time_taken_seconds) as avg_time_seconds
FROM quiz_categories qc
LEFT JOIN quiz_sessions qs ON qc.category_id = qs.category_id AND qs.is_completed = TRUE
GROUP BY qc.category_id, qc.category_name
ORDER BY avg_accuracy DESC;
