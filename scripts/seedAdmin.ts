// scripts/seedAdmin.ts
import * as admin from 'firebase-admin';

// Firebase 에뮬레이터 환경에서 실행
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// 서비스 계정 키를 사용하거나, 이미 초기화된 default 앱 사용
admin.initializeApp({
  projectId: 'braille-app-19a76'
});

async function seedAdmin() {
  try {
    // 1) 이미 존재하는지 확인
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail('admin@gmail.com');
    } catch {
      // 존재하지 않으면 만들어 줌
      userRecord = await admin.auth().createUser({
        email: 'admin@gmail.com',
        password: 'admin1234@',
        displayName: 'Super Admin',
      });
      console.log('✅ Created auth user:', userRecord.uid);
    }

    // 2) Firestore users 컬렉션에도 문서 생성 (isAdmin:1)
    const uref = admin.firestore().doc(`users/${userRecord.uid}`);
    const snap = await uref.get();
    if (!snap.exists) {
      await uref.set({
        email: userRecord.email,
        name: userRecord.displayName,
        dateOfBirth: '2000-01-01',
        isAdmin: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Created user doc with isAdmin flag');
    } else {
      console.log('ℹ️  user doc already exists');
    }
  } catch (e) {
    console.error('❌ seedAdmin failed:', e);
  }
}

seedAdmin();
