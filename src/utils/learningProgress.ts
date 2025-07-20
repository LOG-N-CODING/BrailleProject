import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from 'firebase/auth';

export interface LearningProgress {
  letters: { [key: string]: number }; // 0: 미완료, 1: 완료
  numbers: { [key: string]: number };
  words: { [category: string]: { [word: string]: number } };
  phrases: { [category: string]: { [phrase: string]: number } };
  updatedAt?: any;
}

// 초기 학습 진행도 데이터 생성
export const createInitialLearningProgress = (): LearningProgress => {
  // 알파벳 초기화 (A-Z)
  const letters: { [key: string]: number } = {};
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    letters[letter] = 0;
  }

  // 숫자 초기화 (0-9)
  const numbers: { [key: string]: number } = {};
  for (let i = 0; i <= 9; i++) {
    numbers[i.toString()] = 0;
  }

  return {
    letters,
    numbers,
    words: {},
    phrases: {},
    updatedAt: serverTimestamp(),
  };
};

// 사용자의 학습 진행도 가져오기
export const getUserLearningProgress = async (user: User): Promise<LearningProgress> => {
  try {
    const progressRef = doc(db, 'users', user.uid, 'learningProgress', 'data');
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      return progressSnap.data() as LearningProgress;
    } else {
      // 진행도가 없으면 초기 데이터 생성
      const initialProgress = createInitialLearningProgress();
      await setDoc(progressRef, initialProgress);
      return initialProgress;
    }
  } catch (error) {
    console.error('Error getting learning progress:', error);
    return createInitialLearningProgress();
  }
};

// 알파벳 학습 완료 저장
export const updateLetterProgress = async (user: User, letter: string): Promise<void> => {
  console.log('🔥 updateLetterProgress called with:', {
    userId: user.uid,
    email: user.email,
    letter,
  });
  console.log(
    '🗂️ Firebase Console URL:',
    `https://console.firebase.google.com/project/braille-app-19a76/firestore/data/~2Fusers~2F${user.uid}~2FlearningProgress~2Fdata`
  );

  try {
    const progressRef = doc(db, 'users', user.uid, 'learningProgress', 'data');
    console.log('📍 Firestore reference path:', `users/${user.uid}/learningProgress/data`);

    const progressSnap = await getDoc(progressRef);
    console.log('📄 Document exists:', progressSnap.exists());

    if (progressSnap.exists()) {
      console.log('🔄 Updating existing document...');
      const currentProgress = progressSnap.data() as LearningProgress;
      console.log('📊 Current progress:', currentProgress);

      await updateDoc(progressRef, {
        [`letters.${letter}`]: 1,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Document updated successfully');
    } else {
      console.log('🆕 Creating new document...');
      // 진행도가 없으면 초기 데이터 생성 후 업데이트
      const initialProgress = createInitialLearningProgress();
      initialProgress.letters[letter] = 1;
      console.log('📝 Initial progress to save:', initialProgress);

      await setDoc(progressRef, initialProgress);
      console.log('✅ New document created successfully');
    }

    console.log(`🎯 Letter ${letter} progress updated successfully`);

    // 저장 후 바로 읽어서 확인
    console.log('🔍 Verifying save by reading back data...');
    const verifySnap = await getDoc(progressRef);
    if (verifySnap.exists()) {
      const verifyData = verifySnap.data() as LearningProgress;
      console.log('✅ Verification successful! Current data:', {
        letter: letter,
        status: verifyData.letters[letter],
        fullLettersData: verifyData.letters,
        updatedAt: verifyData.updatedAt,
      });
    } else {
      console.log('⚠️ Verification failed - document not found after save');
    }
  } catch (error) {
    console.error('💥 Error updating letter progress:', error);
    console.error('Error details:', {
      code: (error as any).code,
      message: (error as any).message,
      stack: (error as any).stack,
    });
    throw error; // 에러를 다시 던져서 호출하는 곳에서도 확인할 수 있도록
  }
};

// 숫자 학습 완료 저장
export const updateNumberProgress = async (user: User, number: string): Promise<void> => {
  console.log('🔥 updateNumberProgress called with:', {
    userId: user.uid,
    email: user.email,
    number,
  });
  console.log(
    '🗂️ Firebase Console URL:',
    `https://console.firebase.google.com/project/braille-app-19a76/firestore/data/~2Fusers~2F${user.uid}~2FlearningProgress~2Fdata`
  );

  try {
    const progressRef = doc(db, 'users', user.uid, 'learningProgress', 'data');
    console.log('📍 Firestore reference path:', `users/${user.uid}/learningProgress/data`);

    const progressSnap = await getDoc(progressRef);
    console.log('📄 Document exists:', progressSnap.exists());

    if (progressSnap.exists()) {
      console.log('🔄 Updating existing document...');
      const currentProgress = progressSnap.data() as LearningProgress;
      console.log('📊 Current progress:', currentProgress);

      await updateDoc(progressRef, {
        [`numbers.${number}`]: 1,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Document updated successfully');
    } else {
      console.log('🆕 Creating new document...');
      const initialProgress = createInitialLearningProgress();
      initialProgress.numbers[number] = 1;
      console.log('📝 Initial progress to save:', initialProgress);

      await setDoc(progressRef, initialProgress);
      console.log('✅ New document created successfully');
    }

    console.log(`🎯 Number ${number} progress updated successfully`);

    // 저장 후 바로 읽어서 확인
    console.log('🔍 Verifying save by reading back data...');
    const verifySnap = await getDoc(progressRef);
    if (verifySnap.exists()) {
      const verifyData = verifySnap.data() as LearningProgress;
      console.log('✅ Verification successful! Current data:', {
        number: number,
        status: verifyData.numbers[number],
        fullNumbersData: verifyData.numbers,
        updatedAt: verifyData.updatedAt,
      });
    } else {
      console.log('⚠️ Verification failed - document not found after save');
    }
  } catch (error) {
    console.error('💥 Error updating number progress:', error);
    console.error('Error details:', {
      code: (error as any).code,
      message: (error as any).message,
      stack: (error as any).stack,
    });
    throw error;
  }
};

// 단어 학습 완료 저장
export const updateWordProgress = async (
  user: User,
  category: string,
  word: string
): Promise<void> => {
  console.log('🔥 updateWordProgress called with:', {
    userId: user.uid,
    email: user.email,
    category,
    word,
  });
  console.log(
    '🗂️ Firebase Console URL:',
    `https://console.firebase.google.com/project/braille-app-19a76/firestore/data/~2Fusers~2F${user.uid}~2FlearningProgress~2Fdata`
  );

  try {
    const progressRef = doc(db, 'users', user.uid, 'learningProgress', 'data');
    console.log('📍 Firestore reference path:', `users/${user.uid}/learningProgress/data`);

    const progressSnap = await getDoc(progressRef);
    console.log('📄 Document exists:', progressSnap.exists());

    if (progressSnap.exists()) {
      console.log('🔄 Updating existing document...');
      const currentProgress = progressSnap.data() as LearningProgress;
      console.log('📊 Current progress:', currentProgress);

      await updateDoc(progressRef, {
        [`words.${category}.${word}`]: 1,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Document updated successfully');
    } else {
      console.log('🆕 Creating new document...');
      const initialProgress = createInitialLearningProgress();
      if (!initialProgress.words[category]) {
        initialProgress.words[category] = {};
      }
      initialProgress.words[category][word] = 1;
      console.log('📝 Initial progress to save:', initialProgress);

      await setDoc(progressRef, initialProgress);
      console.log('✅ New document created successfully');
    }

    console.log(`🎯 Word "${word}" in category "${category}" progress updated successfully`);

    // 저장 후 바로 읽어서 확인
    console.log('🔍 Verifying save by reading back data...');
    const verifySnap = await getDoc(progressRef);
    if (verifySnap.exists()) {
      const verifyData = verifySnap.data() as LearningProgress;
      console.log('✅ Verification successful! Current data:', {
        category: category,
        word: word,
        status: verifyData.words[category]?.[word],
        fullWordsData: verifyData.words,
        updatedAt: verifyData.updatedAt,
      });
    } else {
      console.log('⚠️ Verification failed - document not found after save');
    }
  } catch (error) {
    console.error('💥 Error updating word progress:', error);
    console.error('Error details:', {
      code: (error as any).code,
      message: (error as any).message,
      stack: (error as any).stack,
    });
    throw error;
  }
};

// 숙어 학습 완료 저장
export const updatePhraseProgress = async (
  user: User,
  category: string,
  phrase: string
): Promise<void> => {
  console.log('🔥 updatePhraseProgress called with:', {
    userId: user.uid,
    email: user.email,
    category,
    phrase,
  });
  console.log(
    '🗂️ Firebase Console URL:',
    `https://console.firebase.google.com/project/braille-app-19a76/firestore/data/~2Fusers~2F${user.uid}~2FlearningProgress~2Fdata`
  );

  try {
    const progressRef = doc(db, 'users', user.uid, 'learningProgress', 'data');
    console.log('📍 Firestore reference path:', `users/${user.uid}/learningProgress/data`);

    const progressSnap = await getDoc(progressRef);
    console.log('📄 Document exists:', progressSnap.exists());

    if (progressSnap.exists()) {
      console.log('🔄 Updating existing document...');
      const currentProgress = progressSnap.data() as LearningProgress;
      console.log('📊 Current progress:', currentProgress);

      await updateDoc(progressRef, {
        [`phrases.${category}.${phrase}`]: 1,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Document updated successfully');
    } else {
      console.log('🆕 Creating new document...');
      const initialProgress = createInitialLearningProgress();
      if (!initialProgress.phrases[category]) {
        initialProgress.phrases[category] = {};
      }
      initialProgress.phrases[category][phrase] = 1;
      console.log('📝 Initial progress to save:', initialProgress);

      await setDoc(progressRef, initialProgress);
      console.log('✅ New document created successfully');
    }

    console.log(`🎯 Phrase "${phrase}" in category "${category}" progress updated successfully`);

    // 저장 후 바로 읽어서 확인
    console.log('🔍 Verifying save by reading back data...');
    const verifySnap = await getDoc(progressRef);
    if (verifySnap.exists()) {
      const verifyData = verifySnap.data() as LearningProgress;
      console.log('✅ Verification successful! Current data:', {
        category: category,
        phrase: phrase,
        status: verifyData.phrases[category]?.[phrase],
        fullPhrasesData: verifyData.phrases,
        updatedAt: verifyData.updatedAt,
      });
    } else {
      console.log('⚠️ Verification failed - document not found after save');
    }
  } catch (error) {
    console.error('💥 Error updating phrase progress:', error);
    console.error('Error details:', {
      code: (error as any).code,
      message: (error as any).message,
      stack: (error as any).stack,
    });
    throw error;
  }
};

// 전체 학습 진행도 통계 가져오기

interface CategoryStat {
  completed: number;
  total: number;
}
interface LearningStats {
  letters: { completed: number; total: number };
  numbers: { completed: number; total: number };
  words: Record<string, CategoryStat>;
  phrases: Record<string, CategoryStat>;
  overall: { completed: number; total: number };
}

export const getLearningStats = async (user: User): Promise<LearningStats | null> => {
  try {
    // 1) 사용자 progress
    const progress = await getUserLearningProgress(user);

    // 2) words 컬렉션 전체 데이터: 카테고리별로 묶어서 total 계산
    const wordSnaps = await getDocs(collection(db, 'words'));
    const wordsByCat: Record<string, string[]> = {};
    wordSnaps.docs.forEach(d => {
      const { category, content } = d.data() as { category: string; content: string };
      wordsByCat[category] = wordsByCat[category] ?? [];
      wordsByCat[category].push(content);
    });

    // 3) phrases 컬렉션 전체 데이터: 카테고리별로 묶어서 total 계산
    const phraseSnaps = await getDocs(collection(db, 'phrases'));
    const phrasesByCat: Record<string, string[]> = {};
    phraseSnaps.docs.forEach(d => {
      const { category, content } = d.data() as { category: string; content: string };
      phrasesByCat[category] = phrasesByCat[category] ?? [];
      phrasesByCat[category].push(content);
    });

    // 4) 카테고리별 통계 조합
    const wordStats: Record<string, CategoryStat> = {};
    for (const [cat, allContents] of Object.entries(wordsByCat)) {
      const userCatProg = progress.words[cat] ?? {};
      const completed = Object.values(userCatProg).filter(v => v === 1).length;
      wordStats[cat] = { completed, total: allContents.length };
    }

    console.log('📊 Word stats:', wordStats);

    const phraseStats: Record<string, CategoryStat> = {};
    for (const [cat, allContents] of Object.entries(phrasesByCat)) {
      const userCatProg = progress.phrases[cat] ?? {};
      const completed = Object.values(userCatProg).filter(v => v === 1).length;
      phraseStats[cat] = { completed, total: allContents.length };
    }
    console.log('📊 Phrase stats:', phraseStats);

    // 5) letters & numbers 기존 방식
    const letterCompleted = Object.values(progress.letters).filter(v => v === 1).length;
    const letterTotal = Object.keys(progress.letters).length;
    const numberCompleted = Object.values(progress.numbers).filter(v => v === 1).length;
    const numberTotal = Object.keys(progress.numbers).length;

    // 6) overall 집계
    const totalCompleted =
      letterCompleted +
      numberCompleted +
      Object.values(wordStats).reduce((s, c) => s + c.completed, 0) +
      Object.values(phraseStats).reduce((s, c) => s + c.completed, 0);

    const totalItems =
      letterTotal +
      numberTotal +
      Object.values(wordStats).reduce((s, c) => s + c.total, 0) +
      Object.values(phraseStats).reduce((s, c) => s + c.total, 0);

    return {
      letters: { completed: letterCompleted, total: letterTotal },
      numbers: { completed: numberCompleted, total: numberTotal },
      words: wordStats,
      phrases: phraseStats,
      overall: { completed: totalCompleted, total: totalItems },
    };
  } catch (error) {
    console.error('Error getting learning stats:', error);
    return null;
  }
};
