// functions/src/index.ts

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface DeleteUserData {
  uid: string;
}

export const deleteUserAndData = onCall<DeleteUserData>(async (request) => {
  // 1) 인증된 호출자인지
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }
  const callerUid = request.auth.uid;

  // 2) 관리자 권한 확인
  const callerSnap = await admin.firestore().doc(`users/${callerUid}`).get();
  if (!callerSnap.exists || callerSnap.data()?.isAdmin !== 1) {
    throw new HttpsError('permission-denied', '관리자만 접근 가능합니다.');
  }

  // 3) 삭제 대상 UID
  const targetUid = request.data.uid;
  if (!targetUid) {
    throw new HttpsError('invalid-argument', 'uid가 필요합니다.');
  }

  // 4) Auth & Firestore 삭제
  await admin.auth().deleteUser(targetUid);
  await admin.firestore().doc(`users/${targetUid}`).delete();

  return { success: true, message: '사용자가 성공적으로 삭제되었습니다.' };
});
