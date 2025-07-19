import { collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from 'firebase/auth';

export interface GameHistoryData {
  username: string;
  type: 'GAME' | 'SPRINT';
  cpm: number;
  combo: number;
  score: number;
  accuracy: number;
  createdAt: Date;
}

export interface GameHistoryEntry extends GameHistoryData {
  id: string;
}

// 최근 저장된 게임 기록을 추적하기 위한 Map (메모리 기반 중복 방지)
const recentGameSaves = new Map<string, number>();

/**
 * 게임 히스토리를 Firestore에 저장
 */
export const saveGameHistory = async (
  user: User,
  gameData: {
    type: 'GAME' | 'SPRINT';
    cpm: number;
    combo: number;
    score: number;
    accuracy: number;
  }
): Promise<void> => {
  if (!user || !user.email) {
    console.error('❌ User not authenticated - cannot save game history');
    throw new Error('User not authenticated');
  }

  // 중복 저장 방지: 동일한 사용자가 짧은 시간 내에 동일한 결과를 저장하려고 하는지 확인
  const saveKey = `${user.uid}-${gameData.type}-${gameData.score}-${gameData.cpm}`;
  const now = Date.now();
  const lastSaveTime = recentGameSaves.get(saveKey);
  
  if (lastSaveTime && (now - lastSaveTime) < 5000) { // 5초 이내 중복 저장 방지
    console.log('⚠️ Duplicate save attempt detected - skipping save');
    return;
  }

  // 저장 시도를 기록
  recentGameSaves.set(saveKey, now);
  
  // 5분 후 기록 정리 (메모리 누수 방지)
  setTimeout(() => {
    recentGameSaves.delete(saveKey);
  }, 300000);

  try {
    console.log('💾 Saving game history to Firestore:', {
      username: user.email,
      ...gameData
    });

    const historyData: GameHistoryData = {
      username: user.email,
      type: gameData.type,
      cpm: gameData.cpm,
      combo: gameData.combo,
      score: gameData.score,
      accuracy: gameData.accuracy,
      createdAt: new Date()
    };

    // 사용자별 하위 컬렉션에 저장
    const docRef = await addDoc(collection(db, 'users', user.uid, 'gameHistory'), historyData);
    console.log('✅ Game history saved successfully with ID:', docRef.id);
  } catch (error) {
    console.error('❌ Failed to save game history:', error);
    throw error;
  }
};

/**
 * 특정 사용자의 게임 히스토리 조회
 */
export const getUserGameHistory = async (
  user: User,
  gameType?: 'GAME' | 'SPRINT',
  limitCount: number = 20
): Promise<GameHistoryEntry[]> => {
  if (!user || !user.email) {
    console.error('❌ User not authenticated - cannot fetch game history');
    return [];
  }

  try {
    console.log('📊 Fetching game history for user:', user.email, 'gameType:', gameType);

    // 기본 쿼리 (모든 게임 기록을 가져온 후 클라이언트에서 필터링)
    const q = query(
      collection(db, 'users', user.uid, 'gameHistory'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const allHistory: GameHistoryEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as GameHistoryData;
      allHistory.push({
        id: doc.id,
        ...data
      });
    });

    // 클라이언트에서 게임 타입 필터링
    let filteredHistory = allHistory;
    if (gameType) {
      filteredHistory = allHistory.filter(entry => entry.type === gameType);
    }

    // 제한된 개수만 반환
    const limitedHistory = filteredHistory.slice(0, limitCount);

    console.log(`✅ Fetched ${limitedHistory.length} game history entries (total: ${allHistory.length}, filtered: ${filteredHistory.length})`);
    return limitedHistory;
  } catch (error) {
    console.error('❌ Failed to fetch game history:', error);
    return [];
  }
};

/**
 * 사용자의 최고 기록 조회
 */
export const getUserBestRecords = async (
  user: User,
  gameType?: 'GAME' | 'SPRINT'
): Promise<{
  highestCPM: number;
  highestCombo: number;
  highestScore: number;
  bestAccuracy: number;
}> => {
  if (!user || !user.email) {
    console.error('❌ User not authenticated - cannot fetch best records');
    return {
      highestCPM: 0,
      highestCombo: 0,
      highestScore: 0,
      bestAccuracy: 0
    };
  }

  try {
    console.log('🏆 Fetching best records for user:', user.email, 'gameType:', gameType);

    // 기본 쿼리 (모든 게임 기록을 가져온 후 클라이언트에서 필터링)
    const q = query(
      collection(db, 'users', user.uid, 'gameHistory'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    let highestCPM = 0;
    let highestCombo = 0;
    let highestScore = 0;
    let bestAccuracy = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data() as GameHistoryData;
      
      // 게임 타입 필터링 (클라이언트에서)
      if (gameType && data.type !== gameType) {
        return; // 해당 타입이 아니면 건너뛰기
      }
      
      highestCPM = Math.max(highestCPM, data.cpm);
      highestCombo = Math.max(highestCombo, data.combo);
      highestScore = Math.max(highestScore, data.score);
      bestAccuracy = Math.max(bestAccuracy, data.accuracy);
    });

    const bestRecords = {
      highestCPM,
      highestCombo,
      highestScore,
      bestAccuracy
    };

    console.log('🏆 Best records fetched:', bestRecords);
    return bestRecords;
  } catch (error) {
    console.error('❌ Failed to fetch best records:', error);
    return {
      highestCPM: 0,
      highestCombo: 0,
      highestScore: 0,
      bestAccuracy: 0
    };
  }
};

/**
 * 게임 통계 요약 조회
 */
export const getUserGameStats = async (
  user: User
): Promise<{
  totalGames: number;
  typingGames: number;
  sprintGames: number;
  averageCPM: number;
  averageAccuracy: number;
}> => {
  if (!user || !user.email) {
    console.error('❌ User not authenticated - cannot fetch game stats');
    return {
      totalGames: 0,
      typingGames: 0,
      sprintGames: 0,
      averageCPM: 0,
      averageAccuracy: 0
    };
  }

  try {
    console.log('📈 Fetching game stats for user:', user.email);

    const q = query(
      collection(db, 'users', user.uid, 'gameHistory'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    let totalGames = 0;
    let typingGames = 0;
    let sprintGames = 0;
    let totalCPM = 0;
    let totalAccuracy = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data() as GameHistoryData;
      
      totalGames++;
      totalCPM += data.cpm;
      totalAccuracy += data.accuracy;

      if (data.type === 'GAME') {
        typingGames++;
      } else if (data.type === 'SPRINT') {
        sprintGames++;
      }
    });

    const stats = {
      totalGames,
      typingGames,
      sprintGames,
      averageCPM: totalGames > 0 ? Math.round(totalCPM / totalGames) : 0,
      averageAccuracy: totalGames > 0 ? Math.round((totalAccuracy / totalGames) * 100) / 100 : 0
    };

    console.log('📈 Game stats fetched:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Failed to fetch game stats:', error);
    return {
      totalGames: 0,
      typingGames: 0,
      sprintGames: 0,
      averageCPM: 0,
      averageAccuracy: 0
    };
  }
};

/**
 * 전체 사용자 랭킹 조회 (점수, CPM, 정확도 기준)
 */
export const getGlobalRanking = async (limitCount: number = 10): Promise<{
  id: string;
  username: string;
  name?: string;
  birth?: string;
  score: number;
  cpm: number;
  accuracy: number;
  createdAt: Date;
}[]> => {
  try {
    console.log('🏆 Fetching global ranking...');

    // 모든 사용자의 게임 기록을 수집
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const userRankings: {
      id: string;
      username: string;
      name?: string;
      birth?: string;
      score: number;
      cpm: number;
      accuracy: number;
      createdAt: Date;
    }[] = [];

    // 각 사용자의 최고 기록을 수집
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      try {
        // 사용자의 게임 기록 조회
        const gameHistoryRef = collection(db, 'users', userId, 'gameHistory');
        const gameHistoryQuery = query(gameHistoryRef, orderBy('score', 'desc'), limit(1));
        const gameHistorySnapshot = await getDocs(gameHistoryQuery);
        
        if (!gameHistorySnapshot.empty) {
          const bestGame = gameHistorySnapshot.docs[0];
          const gameData = bestGame.data() as GameHistoryData;
          
          userRankings.push({
            id: userId,
            username: gameData.username,
            name: userData.name || gameData.username.split('@')[0],
            birth: userData.dateOfBirth || '2024',
            score: gameData.score,
            cpm: gameData.cpm,
            accuracy: gameData.accuracy,
            createdAt: gameData.createdAt
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch game history for user ${userId}:`, error);
      }
    }

    // 점수 기준으로 정렬 후 제한
    const sortedRankings = userRankings
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount);

    console.log('✅ Global ranking fetched:', sortedRankings.length, 'users');
    return sortedRankings;
  } catch (error) {
    console.error('❌ Failed to fetch global ranking:', error);
    return [];
  }
};
