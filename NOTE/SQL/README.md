# Braille Learning Platform Database Design

## 프로젝트 개요
**학생명**: 안진우  
**프로젝트 제목**: Braille Input Device and Web Content for Learning  
**Part A**: Braille input device and web contents

## 데이터베이스 설계 목표

이 데이터베이스는 점자 학습 플랫폼의 모든 기능을 지원하도록 설계되었습니다:

1. **사용자 관리**: 학생, 교사, 관리자 역할 지원
2. **학습 진도 추적**: 개인별 점자 학습 진도 관리
3. **게임 시스템**: 타이핑 게임, 스프린트 등 게임 데이터 관리
4. **퀴즈 시스템**: 이미지-점자 변환, 수학 퀴즈 등
5. **배지 및 성취**: 학습 동기 부여를 위한 배지 시스템
6. **리더보드**: 경쟁적 학습 환경 조성
7. **커뮤니티**: 포럼을 통한 학습자 간 소통
8. **학습 자료**: 교육 리소스 관리
9. **디바이스 연동**: 2x4 점자 입력 장치 세션 관리

## 파일 구조

### 1. `database_schema.sql`
메인 데이터베이스 스키마 파일로 다음을 포함합니다:
- **핵심 테이블**: 사용자, 학습 진도, 게임, 퀴즈, 배지 등
- **관계 테이블**: 사용자-배지, 리더보드 엔트리 등
- **인덱스**: 성능 최적화를 위한 인덱스 생성
- **초기 데이터**: 기본 설정 및 카테고리 데이터

### 2. `views_and_procedures.sql`
고급 데이터베이스 기능 파일:
- **뷰(Views)**: 복잡한 쿼리를 단순화하는 뷰들
- **저장 프로시저**: 비즈니스 로직을 캡슐화한 프로시저들
- **트리거**: 데이터 변경 시 자동 실행되는 트리거들
- **함수**: 재사용 가능한 계산 함수들

### 3. `sample_data.sql`
테스트 및 개발을 위한 샘플 데이터:
- **사용자 데이터**: 학생, 교사 샘플 계정
- **학습 기록**: 다양한 학습 진도 상태
- **게임 및 퀴즈**: 완료된 세션 데이터
- **커뮤니티 데이터**: 포럼 게시글 및 댓글

## 주요 테이블 설명

### 사용자 관리
- **users**: 기본 사용자 정보 및 권한 관리
- **user_learning_progress**: 개인별 학습 진도 추적
- **user_badges**: 사용자가 획득한 배지 정보
- **user_activity_log**: 사용자 활동 로그

### 학습 시스템
- **learning_stages**: 학습 단계 정의 (알파벳, 숫자, 연습)
- **quiz_categories**: 퀴즈 카테고리 분류
- **quiz_questions**: 퀴즈 문제 및 정답
- **quiz_sessions**: 퀴즈 세션 관리
- **quiz_answers**: 개별 답안 기록

### 게임 시스템
- **games**: 게임 정의 및 설정
- **game_sessions**: 게임 세션 결과 저장
- **leaderboards**: 리더보드 정의
- **leaderboard_entries**: 리더보드 순위 데이터

### 커뮤니티
- **forum_categories**: 포럼 카테고리
- **forum_posts**: 포럼 게시글
- **forum_replies**: 댓글 및 대댓글
- **learning_resources**: 학습 자료 관리

### 디바이스 연동
- **device_sessions**: 점자 입력 장치 세션 데이터
- **badges**: 성취 배지 정의 및 획득 조건

## 주요 기능

### 1. 학습 진도 추적
```sql
-- 사용자별 학습 진도 조회
SELECT * FROM v_user_learning_summary WHERE user_id = 'user_001';

-- 학습 진도 업데이트
CALL UpdateLearningProgress('user_001', 1, 'A', TRUE, 1200);
```

### 2. 배지 시스템
```sql
-- 배지 자동 확인 및 부여
CALL CheckAndAwardBadges('user_001');

-- 사용자 배지 현황 조회
SELECT * FROM v_user_badge_summary WHERE user_id = 'user_001';
```

### 3. 리더보드 관리
```sql
-- 리더보드 업데이트
CALL UpdateLeaderboard(1, 'user_001', 2500.00, '{"sessions": 15}');

-- 현재 리더보드 조회
SELECT * FROM v_current_leaderboard WHERE leaderboard_name = 'Overall Champions';
```

### 4. 대시보드 데이터
```sql
-- 사용자 대시보드 데이터 조회
CALL GetUserDashboard('user_001');
```

## 설치 및 사용 방법

### 1. 데이터베이스 생성
```sql
CREATE DATABASE braille_learning_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE braille_learning_platform;
```

### 2. 스키마 생성
```bash
mysql -u username -p braille_learning_platform < database_schema.sql
```

### 3. 뷰 및 프로시저 생성
```bash
mysql -u username -p braille_learning_platform < views_and_procedures.sql
```

### 4. 샘플 데이터 삽입 (선택사항)
```bash
mysql -u username -p braille_learning_platform < sample_data.sql
```

## 성능 최적화

### 인덱스 전략
- 자주 조회되는 컬럼에 인덱스 생성
- 복합 인덱스를 통한 다중 조건 검색 최적화
- 외래 키 컬럼 인덱스 자동 생성

### 파티셔닝 고려사항
- 대용량 로그 테이블 (user_activity_log)에 대한 날짜 기반 파티셔닝
- 게임 세션 데이터의 월별 파티셔닝

## 보안 고려사항

### 데이터 보호
- 비밀번호 해시 저장 (bcrypt)
- 개인정보 최소화 수집
- 로그 데이터 주기적 정리

### 접근 제어
- 역할 기반 접근 제어 (RBAC)
- 민감한 데이터 접근 로그 기록
- API 인증 및 권한 검증

## 확장 가능성

### 다국어 지원
- 다국어 콘텐츠를 위한 번역 테이블 추가 가능
- 언어별 점자 시스템 지원 확장

### 고급 분석
- 학습 패턴 분석을 위한 데이터 마트 구축
- 머신러닝 모델을 위한 특성 추출 테이블

### 실시간 기능
- 실시간 알림을 위한 이벤트 테이블
- 웹소켓 세션 관리 테이블

## 관리 및 모니터링

### 백업 전략
```sql
-- 일일 백업 스크립트 예시
mysqldump -u username -p braille_learning_platform > backup_$(date +%Y%m%d).sql
```

### 모니터링 쿼리
```sql
-- 활성 사용자 수 조회
SELECT COUNT(*) FROM users WHERE last_login_at > DATE_SUB(NOW(), INTERVAL 7 DAY);

-- 시스템 사용률 통계
SELECT 
    DATE(created_at) as date,
    COUNT(*) as daily_activities
FROM user_activity_log 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date;
```

## 개발 환경 설정

### 필수 소프트웨어
- MySQL 8.0 이상
- 적절한 문자 집합 (utf8mb4) 설정
- 충분한 저장 공간 및 메모리

### 권장 설정
```sql
-- MySQL 설정 예시
[mysqld]
character_set_server=utf8mb4
collation_server=utf8mb4_unicode_ci
innodb_buffer_pool_size=1G
max_connections=200
```

이 데이터베이스 설계는 점자 학습 플랫폼의 모든 요구사항을 충족하도록 설계되었으며, 확장 가능하고 유지보수가 용이한 구조로 구성되어 있습니다.
