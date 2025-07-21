// functions/src/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const deleteUserAndData = functions.https.onCall(async (data, context) => {
  // 1) 인증된 호출자인지
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }
  const callerUid = context.auth.uid;

  // 2) 관리자 권한 확인
  const callerSnap = await admin.firestore().doc(`users/${callerUid}`).get();
  if (!callerSnap.exists || callerSnap.data()?.isAdmin !== 1) {
    throw new functions.https.HttpsError('permission-denied', '관리자만 접근 가능합니다.');
  }

  // 3) 삭제 대상 UID
  const targetUid = data.uid as string; // any → string 단언
  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'uid가 필요합니다.');
  }

  // 4) Auth & Firestore 삭제
  await admin.auth().deleteUser(targetUid);
  await admin.firestore().doc(`users/${targetUid}`).delete();

  return { success: true };
});
