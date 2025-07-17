-- =============================================================================
-- Braille Learning Platform - Views and Stored Procedures
-- =============================================================================

-- =============================================================================
-- 뷰 (Views) 생성
-- =============================================================================

-- 사용자 학습 진도 요약 뷰
CREATE VIEW v_user_learning_summary AS
SELECT 
    u.user_id,
    u.username,
    u.display_name,
    COUNT(DISTINCT ulp.stage_id) as stages_attempted,
    COUNT(CASE WHEN ulp.mastery_level = 'mastered' THEN 1 END) as mastered_stages,
    AVG(ulp.accuracy_rate) as average_accuracy,
    SUM(ulp.attempts_count) as total_attempts,
    MAX(ulp.last_practice_at) as last_practice_date
FROM users u
LEFT JOIN user_learning_progress ulp ON u.user_id = ulp.user_id
WHERE u.is_active = TRUE
GROUP BY u.user_id, u.username, u.display_name;

-- 게임 통계 뷰
CREATE VIEW v_game_statistics AS
SELECT 
    u.user_id,
    u.username,
    g.game_name,
    COUNT(gs.session_id) as total_sessions,
    AVG(gs.score) as average_score,
    MAX(gs.score) as best_score,
    AVG(gs.accuracy_rate) as average_accuracy,
    AVG(gs.wpm) as average_wpm,
    SUM(gs.time_taken_seconds) as total_time_played
FROM users u
JOIN game_sessions gs ON u.user_id = gs.user_id
JOIN games g ON gs.game_id = g.game_id
WHERE gs.is_completed = TRUE
GROUP BY u.user_id, u.username, g.game_id, g.game_name;

-- 퀴즈 성과 뷰
CREATE VIEW v_quiz_performance AS
SELECT 
    u.user_id,
    u.username,
    qc.category_name,
    COUNT(qs.session_id) as total_sessions,
    AVG(qs.correct_answers * 100.0 / qs.total_questions) as average_accuracy,
    AVG(qs.total_score) as average_score,
    MAX(qs.total_score) as best_score,
    AVG(qs.time_taken_seconds) as average_time
FROM users u
JOIN quiz_sessions qs ON u.user_id = qs.user_id
JOIN quiz_categories qc ON qs.category_id = qc.category_id
WHERE qs.is_completed = TRUE
GROUP BY u.user_id, u.username, qc.category_id, qc.category_name;

-- 리더보드 뷰 (현재 순위)
CREATE VIEW v_current_leaderboard AS
SELECT 
    l.leaderboard_name,
    le.rank_position,
    u.username,
    u.display_name,
    le.score,
    le.additional_stats,
    le.recorded_at
FROM leaderboard_entries le
JOIN leaderboards l ON le.leaderboard_id = l.leaderboard_id
JOIN users u ON le.user_id = u.user_id
WHERE l.is_active = TRUE
ORDER BY l.leaderboard_id, le.rank_position;

-- 사용자 배지 현황 뷰
CREATE VIEW v_user_badge_summary AS
SELECT 
    u.user_id,
    u.username,
    COUNT(ub.badge_id) as total_badges,
    COUNT(CASE WHEN b.rarity = 'common' THEN 1 END) as common_badges,
    COUNT(CASE WHEN b.rarity = 'rare' THEN 1 END) as rare_badges,
    COUNT(CASE WHEN b.rarity = 'epic' THEN 1 END) as epic_badges,
    COUNT(CASE WHEN b.rarity = 'legendary' THEN 1 END) as legendary_badges,
    SUM(b.points_reward) as total_badge_points
FROM users u
LEFT JOIN user_badges ub ON u.user_id = ub.user_id
LEFT JOIN badges b ON ub.badge_id = b.badge_id
WHERE u.is_active = TRUE
GROUP BY u.user_id, u.username;

-- 포럼 활동 요약 뷰
CREATE VIEW v_forum_activity AS
SELECT 
    u.user_id,
    u.username,
    COUNT(DISTINCT fp.post_id) as total_posts,
    COUNT(DISTINCT fr.reply_id) as total_replies,
    SUM(fp.like_count) as post_likes,
    SUM(fr.like_count) as reply_likes,
    MAX(GREATEST(fp.created_at, fr.created_at)) as last_activity
FROM users u
LEFT JOIN forum_posts fp ON u.user_id = fp.user_id
LEFT JOIN forum_replies fr ON u.user_id = fr.user_id
GROUP BY u.user_id, u.username;

-- =============================================================================
-- 저장 프로시저 (Stored Procedures)
-- =============================================================================

-- 사용자 학습 진도 업데이트 프로시저
DELIMITER //
CREATE PROCEDURE UpdateLearningProgress(
    IN p_user_id VARCHAR(50),
    IN p_stage_id INT,
    IN p_character_target VARCHAR(10),
    IN p_is_correct BOOLEAN,
    IN p_time_taken_ms INT
)
BEGIN
    DECLARE v_current_attempts INT DEFAULT 0;
    DECLARE v_current_correct INT DEFAULT 0;
    DECLARE v_best_time INT DEFAULT NULL;
    DECLARE v_new_accuracy DECIMAL(5,2) DEFAULT 0.00;
    DECLARE v_new_mastery ENUM('beginner', 'intermediate', 'advanced', 'mastered') DEFAULT 'beginner';
    
    -- 현재 진도 조회
    SELECT attempts_count, correct_attempts, best_time_ms 
    INTO v_current_attempts, v_current_correct, v_best_time
    FROM user_learning_progress 
    WHERE user_id = p_user_id AND stage_id = p_stage_id AND character_target = p_character_target;
    
    -- 새로운 통계 계산
    SET v_current_attempts = v_current_attempts + 1;
    IF p_is_correct THEN
        SET v_current_correct = v_current_correct + 1;
    END IF;
    
    SET v_new_accuracy = (v_current_correct * 100.0) / v_current_attempts;
    
    -- 최고 시간 업데이트
    IF p_is_correct AND (v_best_time IS NULL OR p_time_taken_ms < v_best_time) THEN
        SET v_best_time = p_time_taken_ms;
    END IF;
    
    -- 숙련도 레벨 결정
    IF v_new_accuracy >= 90 AND v_current_attempts >= 10 THEN
        SET v_new_mastery = 'mastered';
    ELSEIF v_new_accuracy >= 70 AND v_current_attempts >= 5 THEN
        SET v_new_mastery = 'advanced';
    ELSEIF v_new_accuracy >= 50 AND v_current_attempts >= 3 THEN
        SET v_new_mastery = 'intermediate';
    ELSE
        SET v_new_mastery = 'beginner';
    END IF;
    
    -- 진도 업데이트
    INSERT INTO user_learning_progress (
        user_id, stage_id, character_target, mastery_level, attempts_count, 
        correct_attempts, accuracy_rate, best_time_ms, last_practice_at
    ) VALUES (
        p_user_id, p_stage_id, p_character_target, v_new_mastery, v_current_attempts,
        v_current_correct, v_new_accuracy, v_best_time, NOW()
    ) ON DUPLICATE KEY UPDATE
        attempts_count = v_current_attempts,
        correct_attempts = v_current_correct,
        accuracy_rate = v_new_accuracy,
        mastery_level = v_new_mastery,
        best_time_ms = v_best_time,
        last_practice_at = NOW();
END//
DELIMITER ;

-- 배지 확인 및 부여 프로시저
DELIMITER //
CREATE PROCEDURE CheckAndAwardBadges(
    IN p_user_id VARCHAR(50)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_badge_id INT;
    DECLARE v_unlock_condition JSON;
    DECLARE v_condition_type VARCHAR(50);
    
    DECLARE badge_cursor CURSOR FOR 
        SELECT badge_id, unlock_condition 
        FROM badges 
        WHERE is_active = TRUE 
        AND badge_id NOT IN (
            SELECT badge_id FROM user_badges WHERE user_id = p_user_id
        );
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN badge_cursor;
    
    read_loop: LOOP
        FETCH badge_cursor INTO v_badge_id, v_unlock_condition;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET v_condition_type = JSON_UNQUOTE(JSON_EXTRACT(v_unlock_condition, '$.type'));
        
        -- 첫 세션 배지
        IF v_condition_type = 'first_session' THEN
            IF EXISTS (
                SELECT 1 FROM user_learning_progress 
                WHERE user_id = p_user_id LIMIT 1
            ) THEN
                INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge_id);
            END IF;
        END IF;
        
        -- 알파벳 마스터 배지
        IF v_condition_type = 'mastery' AND JSON_UNQUOTE(JSON_EXTRACT(v_unlock_condition, '$.category')) = 'alphabet' THEN
            IF (
                SELECT COUNT(*) FROM user_learning_progress ulp
                JOIN learning_stages ls ON ulp.stage_id = ls.stage_id
                WHERE ulp.user_id = p_user_id 
                AND ls.stage_type = 'alphabet' 
                AND ulp.mastery_level = 'mastered'
            ) >= 26 THEN
                INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge_id);
            END IF;
        END IF;
        
        -- 속도 배지
        IF v_condition_type = 'speed' THEN
            IF EXISTS (
                SELECT 1 FROM game_sessions 
                WHERE user_id = p_user_id 
                AND wpm >= JSON_UNQUOTE(JSON_EXTRACT(v_unlock_condition, '$.threshold'))
            ) THEN
                INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge_id);
            END IF;
        END IF;
        
        -- 정확도 배지
        IF v_condition_type = 'accuracy' THEN
            IF EXISTS (
                SELECT 1 FROM quiz_sessions 
                WHERE user_id = p_user_id 
                AND (correct_answers * 100.0 / total_questions) >= JSON_UNQUOTE(JSON_EXTRACT(v_unlock_condition, '$.threshold'))
            ) THEN
                INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge_id);
            END IF;
        END IF;
        
    END LOOP;
    
    CLOSE badge_cursor;
END//
DELIMITER ;

-- 리더보드 업데이트 프로시저
DELIMITER //
CREATE PROCEDURE UpdateLeaderboard(
    IN p_leaderboard_id INT,
    IN p_user_id VARCHAR(50),
    IN p_score DECIMAL(10,2),
    IN p_additional_stats JSON
)
BEGIN
    DECLARE v_current_rank INT DEFAULT 1;
    
    -- 현재 점수 업데이트
    INSERT INTO leaderboard_entries (leaderboard_id, user_id, score, additional_stats)
    VALUES (p_leaderboard_id, p_user_id, p_score, p_additional_stats)
    ON DUPLICATE KEY UPDATE
        score = p_score,
        additional_stats = p_additional_stats,
        recorded_at = NOW();
    
    -- 순위 재계산
    SET @rank = 0;
    UPDATE leaderboard_entries le
    JOIN (
        SELECT user_id, (@rank := @rank + 1) as new_rank
        FROM leaderboard_entries
        WHERE leaderboard_id = p_leaderboard_id
        ORDER BY score DESC
    ) ranked ON le.user_id = ranked.user_id
    SET le.rank_position = ranked.new_rank
    WHERE le.leaderboard_id = p_leaderboard_id;
END//
DELIMITER ;

-- 사용자 대시보드 데이터 조회 프로시저
DELIMITER //
CREATE PROCEDURE GetUserDashboard(
    IN p_user_id VARCHAR(50)
)
BEGIN
    -- 기본 사용자 정보
    SELECT 
        user_id, username, display_name, created_at, last_login_at
    FROM users 
    WHERE user_id = p_user_id;
    
    -- 학습 진도 요약
    SELECT 
        ls.stage_name,
        ulp.mastery_level,
        ulp.accuracy_rate,
        ulp.attempts_count,
        ulp.last_practice_at
    FROM user_learning_progress ulp
    JOIN learning_stages ls ON ulp.stage_id = ls.stage_id
    WHERE ulp.user_id = p_user_id
    ORDER BY ls.sort_order;
    
    -- 최근 배지 획득
    SELECT 
        b.badge_name,
        b.badge_description,
        b.points_reward,
        ub.earned_at
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.badge_id
    WHERE ub.user_id = p_user_id
    ORDER BY ub.earned_at DESC
    LIMIT 5;
    
    -- 게임 통계
    SELECT 
        g.game_name,
        COUNT(gs.session_id) as sessions_played,
        AVG(gs.score) as avg_score,
        MAX(gs.score) as best_score,
        AVG(gs.accuracy_rate) as avg_accuracy
    FROM game_sessions gs
    JOIN games g ON gs.game_id = g.game_id
    WHERE gs.user_id = p_user_id AND gs.is_completed = TRUE
    GROUP BY g.game_id, g.game_name;
    
    -- 퀴즈 통계
    SELECT 
        qc.category_name,
        COUNT(qs.session_id) as sessions_completed,
        AVG(qs.correct_answers * 100.0 / qs.total_questions) as avg_accuracy,
        AVG(qs.total_score) as avg_score
    FROM quiz_sessions qs
    JOIN quiz_categories qc ON qs.category_id = qc.category_id
    WHERE qs.user_id = p_user_id AND qs.is_completed = TRUE
    GROUP BY qc.category_id, qc.category_name;
END//
DELIMITER ;

-- =============================================================================
-- 트리거 (Triggers)
-- =============================================================================

-- 사용자 생성 시 기본 진도 데이터 생성
DELIMITER //
CREATE TRIGGER tr_user_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    -- 알파벳 A-Z 진도 초기화
    INSERT INTO user_learning_progress (user_id, stage_id, character_target, mastery_level, attempts_count, correct_attempts, accuracy_rate)
    SELECT NEW.user_id, 1, CHAR(64 + num), 'beginner', 0, 0, 0.00
    FROM (
        SELECT 1 as num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
        SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
        SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
        SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
        SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26
    ) nums;
    
    -- 숫자 0-9 진도 초기화
    INSERT INTO user_learning_progress (user_id, stage_id, character_target, mastery_level, attempts_count, correct_attempts, accuracy_rate)
    SELECT NEW.user_id, 2, CAST(num - 1 AS CHAR), 'beginner', 0, 0, 0.00
    FROM (
        SELECT 1 as num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
        SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    ) nums;
END//
DELIMITER ;

-- 퀴즈 완료 시 배지 확인
DELIMITER //
CREATE TRIGGER tr_quiz_session_after_update
AFTER UPDATE ON quiz_sessions
FOR EACH ROW
BEGIN
    IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
        CALL CheckAndAwardBadges(NEW.user_id);
    END IF;
END//
DELIMITER ;

-- 게임 완료 시 배지 확인
DELIMITER //
CREATE TRIGGER tr_game_session_after_update
AFTER UPDATE ON game_sessions
FOR EACH ROW
BEGIN
    IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
        CALL CheckAndAwardBadges(NEW.user_id);
    END IF;
END//
DELIMITER ;

-- =============================================================================
-- 유틸리티 함수
-- =============================================================================

-- 사용자 총 점수 계산 함수
DELIMITER //
CREATE FUNCTION GetUserTotalScore(p_user_id VARCHAR(50))
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total_score INT DEFAULT 0;
    
    SELECT 
        COALESCE(SUM(gs.score), 0) + COALESCE(SUM(qs.total_score), 0) + COALESCE(SUM(b.points_reward), 0)
    INTO v_total_score
    FROM users u
    LEFT JOIN game_sessions gs ON u.user_id = gs.user_id AND gs.is_completed = TRUE
    LEFT JOIN quiz_sessions qs ON u.user_id = qs.user_id AND qs.is_completed = TRUE
    LEFT JOIN user_badges ub ON u.user_id = ub.user_id
    LEFT JOIN badges b ON ub.badge_id = b.badge_id
    WHERE u.user_id = p_user_id;
    
    RETURN v_total_score;
END//
DELIMITER ;

-- 사용자 평균 정확도 계산 함수
DELIMITER //
CREATE FUNCTION GetUserAverageAccuracy(p_user_id VARCHAR(50))
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_avg_accuracy DECIMAL(5,2) DEFAULT 0.00;
    
    SELECT COALESCE(AVG(accuracy_rate), 0.00)
    INTO v_avg_accuracy
    FROM user_learning_progress
    WHERE user_id = p_user_id AND attempts_count > 0;
    
    RETURN v_avg_accuracy;
END//
DELIMITER ;
