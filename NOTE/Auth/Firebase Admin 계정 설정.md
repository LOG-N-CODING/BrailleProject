# Firebase Admin 계정 설정 가이드

## 개요
Firebase Admin SDK를 사용하여 관리자 계정을 생성하고 설정하는 방법에 대한 가이드입니다.

## 1. 환경 설정

### 필요한 패키지 설치
```bash
# TypeScript 실행을 위한 패키지
npm install -D tsx

# Firebase Admin SDK (이미 설치됨)
npm install firebase-admin
```

### package.json scripts 설정
```json
{
  "scripts": {
    "seed-admin": "npx tsx scripts/seedAdmin.ts",
    "emulate": "firebase emulators:start --only functions,firestore,auth"
  }
}
```

## 2. seedAdmin.ts 스크립트 구성

### 파일 위치
`scripts/seedAdmin.ts`

### 주요 구성 요소
```typescript
// Firebase 에뮬레이터 환경 설정
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Firebase Admin 초기화
admin.initializeApp({
  projectId: 'braille-app-19a76'
});
```

## 3. 관리자 계정 생성 프로세스

### 실행 순서
1. Firebase 에뮬레이터 시작
```bash
npm run emulate
```

2. 관리자 계정 생성 스크립트 실행
```bash
npm run seed-admin
```

### 생성되는 데이터
- **Firebase Authentication**: 사용자 계정 생성
- **Firestore Database**: users 컬렉션에 관리자 문서 생성

## 4. 생성된 관리자 계정 정보

### 계정 정보
- **이메일**: admin@gmail.com
- **비밀번호**: admin1234@
- **표시 이름**: Super Admin
- **권한**: isAdmin: 1 (관리자)
- **UID**: m8alqKe9bSfEZ6t3rCDYgxSxZbTE (예시)

### Firestore 문서 구조
```javascript
// users/{uid} 문서
{
  email: "admin@gmail.com",
  name: "Super Admin",
  dateOfBirth: "2000-01-01",
  isAdmin: 1,
  createdAt: serverTimestamp()
}
```

## 5. 문제 해결

### 일반적인 에러와 해결방법

#### 1. ts-node 실행 에러
**에러**: `'ts-node'은(는) 내부 또는 외부 명령이 아닙니다`
**해결**: 
```bash
npm install -D tsx
# package.json에서 "ts-node"를 "npx tsx"로 변경
```

#### 2. TypeScript 확장자 에러
**에러**: `Unknown file extension ".ts"`
**해결**: `tsx` 패키지 사용으로 전환

#### 3. Firebase 인증 에러
**에러**: `Could not load the default credentials`
**해결**: Firebase 에뮬레이터 환경 변수 설정
```typescript
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
```

#### 4. 프로젝트 ID 에러
**에러**: `Unable to detect a Project Id`
**해결**: 명시적 프로젝트 ID 설정
```typescript
admin.initializeApp({
  projectId: 'braille-app-19a76'
});
```

## 6. 사용 방법

### 애플리케이션에서 관리자 로그인
1. 로그인 페이지에서 다음 정보 입력:
   - 이메일: admin@gmail.com
   - 비밀번호: admin1234@

2. 로그인 후 관리자 권한으로 다음 기능 사용 가능:
   - 사용자 관리
   - 콘텐츠 관리
   - 시스템 설정

### 관리자 권한 확인
```javascript
// 사용자의 관리자 권한 확인
const userDoc = await firestore.doc(`users/${uid}`).get();
const isAdmin = userDoc.data()?.isAdmin === 1;
```

## 7. 보안 고려사항

### 개발 환경
- 현재 설정은 Firebase 에뮬레이터 환경에서만 동작
- 실제 Firebase 프로젝트에 영향을 주지 않음

### 운영 환경 배포 시 주의사항
1. 관리자 비밀번호 변경 필요
2. 서비스 계정 키 파일 설정 필요
3. 환경 변수를 통한 민감한 정보 관리

## 8. 추가 참고사항

### Firebase 에뮬레이터 UI
- URL: http://127.0.0.1:4000/
- Authentication: http://127.0.0.1:4000/auth
- Firestore: http://127.0.0.1:4000/firestore

### 로그 확인
- 스크립트 실행 시 성공/실패 메시지 출력
- Firebase 에뮬레이터 로그에서 세부 정보 확인 가능

---

**작성일**: 2025년 7월 22일  
**최종 수정**: 2025년 7월 22일  
**작성자**: LOHA-SOFT
