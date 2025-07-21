import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getLearningStats, getUserLearningProgress } from '../../utils/learningProgress';
import { getUserGameHistory, getUserBestRecords, getGlobalRanking } from '../../utils/gameHistory';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../../components/UI';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface CategoryStat {
  completed: number;
  total: number;
}

interface LearningStats {
  letters: CategoryStat;
  numbers: CategoryStat;
  words: Record<string, CategoryStat>;
  phrases: Record<string, CategoryStat>;
  overall: CategoryStat;
}

interface CategoryProgress {
  [category: string]: { [item: string]: number };
}

interface GameHistoryEntry {
  id: string;
  username: string;
  type: 'GAME' | 'SPRINT';
  cpm: number;
  combo: number;
  score: number;
  accuracy: number;
  createdAt: Date;
}

interface BestRecords {
  highestCPM: number;
  highestCombo: number;
  highestScore: number;
  bestAccuracy: number;
}

interface GlobalRankingEntry {
  id: string;
  username: string;
  name?: string;
  birth?: string;
  score: number;
  cpm: number;
  accuracy: number;
  createdAt: Date;
}

interface LearningProgress {
  letters: Record<string, number>;
  numbers: Record<string, number>;
  words: Record<string, Record<string, number>>;
  phrases: Record<string, Record<string, number>>;
}

interface GameRecord {
  combo: number;
  cpm: number;
  score: number;
  accuracy: number;
  createdAt: Date | string;
  type: 'GAME' | 'SPRINT';
  id: string;
}
const TOTALS = {
  letters: 26, // A~Z
  numbers: 10, // 0~9
  words: 200, // 10개 카테고리 × 20개씩
  phrases: 50, // 5개 카테고리 × 10개씩
};

const MyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'learning' | 'game' | 'badges'>('learning');
  const [stats, setStats] = useState<LearningStats | null>(null);
  // const [wordCategories, setWordCategories] = useState<CategoryProgress>({});
  // const [phraseCategories, setPhraseCategories] = useState<CategoryProgress>({});
  const [bestRecords, setBestRecords] = useState<BestRecords | null>(null);
  const [typingGameHistory, setTypingGameHistory] = useState<GameHistoryEntry[]>([]);
  const [sprintGameHistory, setSprintGameHistory] = useState<GameHistoryEntry[]>([]);
  const [globalRanking, setGlobalRanking] = useState<GlobalRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const initialBadgeCategories = [
    {
      title: 'Start',
      badges: [
        {
          id: 's1',
          name: 'Learn Start',
          active: false,
          description: 'Complete your first learning session',
        },
        {
          id: 's2',
          name: 'All Master Badge',
          active: false,
          description: 'Master all learning categories',
        },
        {
          id: 's3',
          name: 'All Legend Badge',
          active: false,
          description: 'Become a legend in all areas',
        },
      ],
    },
    {
      title: 'Combo Master',
      badges: [
        {
          id: 'combo1',
          name: 'Achieve 2 combos',
          active: false,
          description: 'Get 2 consecutive correct answers',
        },
        {
          id: 'combo2',
          name: 'Achieve 5 combos',
          active: false,
          description: 'Get 5 consecutive correct answers',
        },
        {
          id: 'combo3',
          name: 'Achieve 10 combos',
          active: false,
          description: 'Get 10 consecutive correct answers',
        },
      ],
    },
    {
      title: 'Pro Gamer',
      badges: [
        {
          id: 'game1',
          name: 'Play 1 game',
          active: false,
          description: 'Complete your first game',
        },
        { id: 'game2', name: 'Play 10 games', active: false, description: 'Complete 10 games' },
        { id: 'game3', name: 'Play 50 games', active: false, description: 'Complete 50 games' },
      ],
    },
    {
      title: 'Honor Student',
      badges: [
        {
          id: 'learn1',
          name: 'Reach 30% learning progress',
          active: false,
          description: 'Complete 30% of all learning content',
        },
        {
          id: 'learn2',
          name: 'Reach 60% learning progress',
          active: false,
          description: 'Complete 60% of all learning content',
        },
        {
          id: 'learn3',
          name: 'Reach 100% learning progress',
          active: false,
          description: 'Complete all learning content',
        },
      ],
    },
    {
      title: 'Fast Typist',
      badges: [
        {
          id: 'fast1',
          name: 'Reach 20 CPM',
          active: false,
          description: 'Achieve 20 characters per minute',
        },
        {
          id: 'fast2',
          name: 'Reach 40 CPM',
          active: false,
          description: 'Achieve 40 characters per minute',
        },
        {
          id: 'fast3',
          name: 'Reach 100 CPM',
          active: false,
          description: 'Achieve 100 characters per minute',
        },
      ],
    },
  ];

  // 1) 학습 뱃지 상태 계산
  const computeLearningBadgeStates = ({
    letters = {},
    numbers = {},
    words = {},
    phrases = {},
  }: Partial<LearningProgress>) => {
    // — 전체 개수는 상수로 —
    const alphaTotal = TOTALS.letters;
    const numTotal = TOTALS.numbers;
    const wordTotal = TOTALS.words;
    const phraseTotal = TOTALS.phrases;

    // — 학습한 개수는 progress 데이터로 계산 —
    const alphaLearned = Object.values(letters).filter(v => v > 0).length;
    const numLearned = Object.values(numbers).filter(v => v > 0).length;
    const wordLearned = Object.values(words).reduce(
      (sum, cat) => sum + Object.values(cat).filter(v => v > 0).length,
      0
    );
    const phraseLearned = Object.values(phrases).reduce(
      (sum, cat) => sum + Object.values(cat).filter(v => v > 0).length,
      0
    );

    // — 완료 플래그 —
    const alphaComplete = alphaLearned === alphaTotal;
    const numComplete = numLearned === numTotal;
    const wordComplete = wordLearned === wordTotal;
    const phraseComplete = phraseLearned === phraseTotal;

    // — 전체 통계 —
    const totalContent = alphaTotal + numTotal + wordTotal + phraseTotal;
    const totalLearned = alphaLearned + numLearned + wordLearned + phraseLearned;
    const ratio = totalLearned / totalContent;

    console.log('Learning Progress:', {
      alpha: { learned: alphaLearned, total: alphaTotal, complete: alphaComplete },
      numbers: { learned: numLearned, total: numTotal, complete: numComplete },
      words: { learned: wordLearned, total: wordTotal, complete: wordComplete },
      phrases: { learned: phraseLearned, total: phraseTotal, complete: phraseComplete },
      overall: { learned: totalLearned, total: totalContent, ratio },
    });

    return {
      s1: totalLearned > 0, // 첫 학습 세션
      s2: [alphaComplete, numComplete, wordComplete, phraseComplete].some(Boolean), // 하나 이상 완전 완료
      s3: [alphaComplete, numComplete, wordComplete, phraseComplete].every(Boolean), // 전부 완전 완료
      learn1: ratio >= 0.3, // 30%
      learn2: ratio >= 0.6, // 60%
      learn3: ratio >= 1, // 100%
    };
  };

  // 2) 게임 뱃지 상태 계산
  const computeGameBadgeStates = (records: GameRecord[]) => {
    const combos = records.map(r => r.combo || 0);
    const cpms = records.map(r => r.cpm || 0);
    const maxCombo = combos.length ? Math.max(...combos) : 0;
    const maxCpm = cpms.length ? Math.max(...cpms) : 0;
    const totalGames = records.length;

    return {
      combo1: maxCombo >= 2,
      combo2: maxCombo >= 5,
      combo3: maxCombo >= 10,
      game1: totalGames >= 1,
      game2: totalGames >= 10,
      game3: totalGames >= 50,
      fast1: maxCpm >= 20,
      fast2: maxCpm >= 40,
      fast3: maxCpm >= 100,
    };
  };

  const [badgeCategories, setBadgeCategories] = useState(initialBadgeCategories);

  useEffect(() => {
    if (!user) return;

    const fetchBadges = async () => {
      // — 학습 진행도 불러오기 —
      const colRef = collection(db, 'users', user.uid, 'learningProgress');
      const snaps = await getDocs(colRef);
      if (snaps.empty) {
        console.warn('No docs in learningProgress subcollection');
      } else {
        // 보통 하나의 문서만 쓰신다면 snaps.docs[0]
        const raw = snaps.docs[0].data();
        console.log('▶ raw from subcollection:', raw);
      }

      let learningStates = {
        s1: false,
        s2: false,
        s3: false,
        learn1: false,
        learn2: false,
        learn3: false,
      };
      if (snaps.docs.length > 0) {
        const data = snaps.docs[0].data() as any;
        // 만약 user doc 안에 learningProgress 필드로 저장했다면 data.learningProgress 대신 사용
        const progress = (data.learningProgress ?? data) as LearningProgress;
        learningStates = computeLearningBadgeStates(progress);
      }

      // — 게임 기록 불러오기 —
      const ghSnap = await getDocs(collection(db, 'users', user.uid, 'gameHistory'));
      const history = ghSnap.docs.map(d => d.data() as GameRecord);
      const gameStates = computeGameBadgeStates(history);

      // — badgeCategories 업데이트 —
      setBadgeCategories(prev =>
        prev.map(cat => {
          switch (cat.title) {
            case 'Start':
              return {
                ...cat,
                badges: cat.badges.map((b, i) => ({
                  ...b,
                  active:
                    i === 0 ? learningStates.s1 : i === 1 ? learningStates.s2 : learningStates.s3,
                })),
              };
            case 'Combo Master':
              return {
                ...cat,
                badges: cat.badges.map((b, i) => ({
                  ...b,
                  active: gameStates[`combo${i + 1}` as keyof typeof gameStates],
                })),
              };
            case 'Pro Gamer':
              return {
                ...cat,
                badges: cat.badges.map((b, i) => ({
                  ...b,
                  active: gameStates[`game${i + 1}` as keyof typeof gameStates],
                })),
              };
            case 'Honor Student':
              return {
                ...cat,
                badges: cat.badges.map((b, i) => ({
                  ...b,
                  active: learningStates[`learn${i + 1}` as keyof typeof learningStates],
                })),
              };
            case 'Fast Typist':
              return {
                ...cat,
                badges: cat.badges.map((b, i) => ({
                  ...b,
                  active: gameStates[`fast${i + 1}` as keyof typeof gameStates],
                })),
              };
            default:
              return cat;
          }
        })
      );
    };

    fetchBadges();
  }, [user]);

  const loadUserStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [learningStats, bestRecords, typingHistory, sprintHistory, ranking] = await Promise.all(
        [
          getLearningStats(user),
          // getUserLearningProgress(user),
          getUserBestRecords(user),
          getUserGameHistory(user, 'GAME', 5),
          getUserGameHistory(user, 'SPRINT', 5),
          getGlobalRanking(5),
        ]
      );

      if (learningStats) {
        setStats(learningStats);
      }

      // 카테고리별 진행도 설정
      // setWordCategories(userProgress.words || {});
      // setPhraseCategories(userProgress.phrases || {});

      // 게임 데이터 설정
      setBestRecords(bestRecords);
      setTypingGameHistory(typingHistory);
      setSprintGameHistory(sprintHistory);
      setGlobalRanking(ranking);

      // 디버깅용 로그
      console.log('🎮 Game data loaded:', {
        bestRecords,
        typingHistoryCount: typingHistory.length,
        sprintHistoryCount: sprintHistory.length,
        globalRankingCount: ranking.length,
        globalRanking: ranking,
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserStats();
  }, [user, navigate, loadUserStats]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your learning progress...</div>
      </div>
    );
  }

  const { words: wordStats, phrases: phraseStats } = stats!;

  // 상단 요약
  const wordCompleted = Object.values(wordStats).reduce((sum, s) => sum + s.completed, 0);
  const wordTotal = Object.values(wordStats).reduce((sum, s) => sum + s.total, 0);
  const phraseCompleted = Object.values(phraseStats).reduce((sum, s) => sum + s.completed, 0);
  const phraseTotal = Object.values(phraseStats).reduce((sum, s) => sum + s.total, 0);

  console.log('📊 Stats:', {
    word: { completed: wordCompleted, total: wordTotal },
    phrase: { completed: phraseCompleted, total: phraseTotal },
  });

  const renderLearningStage = () => (
    <div className="space-y-6">
      {/* Basic Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Letters Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-light text-gray-800">Letters</h3>
            <span className="text-2xl font-light text-gray-800">
              {stats?.letters.completed || 0}/{stats?.letters.total || 26}
            </span>
          </div>
        </div>

        {/* Numbers Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-light text-gray-800">Numbers</h3>
            <span className="text-2xl font-light text-gray-800">
              {stats?.numbers.completed || 0}/{stats?.numbers.total || 10}
            </span>
          </div>
        </div>
      </div>

      {/* Words Section */}
      <div className="mb-8">
        {/* Summary */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-light text-gray-800">Words</h3>
            <span className="text-2xl font-light text-gray-800">
              {wordCompleted}/{wordTotal}
            </span>
          </div>
        </div>
        {/* Category별 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(wordStats).map(([category, stat]) => (
            <div key={category} className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h4 className="text-sm font-light text-gray-800 text-center mb-2 leading-tight">
                {category}
              </h4>
              <p className="text-sm font-light text-gray-800 text-center">
                {stat.completed}/{stat.total}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Phrases Section */}
      <div>
        {/* Summary */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-light text-gray-800">Phrases</h3>
            <span className="text-2xl font-light text-gray-800">
              {phraseCompleted}/{phraseTotal}
            </span>
          </div>
        </div>
        {/* Category별 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(phraseStats).map(([category, stat]) => (
            <div key={category} className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h4 className="text-sm font-light text-gray-800 text-center mb-2 leading-tight">
                {category}
              </h4>
              <p className="text-sm font-light text-gray-800 text-center">
                {stat.completed}/{stat.total}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGameHistory = () => {
    // 실제 글로벌 랭킹 데이터 사용
    let gameStats: {
      rank: number | string;
      name: string;
      birth: string;
      score: number;
      cpm: number;
      accuracy: number;
    }[] = globalRanking.map((user, index) => ({
      rank: index + 1,
      name: user.name || user.username.split('@')[0],
      birth: user.birth || '2024',
      score: user.score,
      cpm: user.cpm,
      accuracy: Math.round(user.accuracy),
    }));

    // 현재 사용자가 랭킹에 없는 경우 추가
    if (bestRecords && bestRecords.highestScore > 0) {
      const userInRanking = gameStats.find(
        stat => stat.name === (user?.email?.split('@')[0] || 'You')
      );

      if (!userInRanking) {
        const userRecord = {
          rank: 'Me' as number | string,
          name: user?.email?.split('@')[0] || 'You',
          birth: '2024',
          score: bestRecords.highestScore,
          cpm: bestRecords.highestCPM,
          accuracy: Math.round(bestRecords.bestAccuracy),
        };

        // 점수 기준으로 정렬하여 랭킹 결정
        const allStats = [...gameStats, userRecord];
        allStats.sort((a, b) => b.score - a.score);

        // 사용자의 실제 랭킹 찾기
        const userRankIndex = allStats.findIndex(stat => stat.name === userRecord.name);
        userRecord.rank = userRankIndex + 1;

        // 상위 5개만 표시하되, 사용자가 5위 밖이면 'Me'로 표시
        if (userRankIndex >= 5) {
          userRecord.rank = 'Me';
          gameStats.push(userRecord);
        }
      }
    }

    // 랭크 카드 데이터 (실제 사용자 데이터 기반)
    const rankCards = gameStats.slice(0, 5).map((stat, index) => {
      const rankNames = ['Challenger', 'Master', 'Gold', 'Silver', 'Bronze'];
      const rankImages = [
        '/images/figma/my/rank/challenger.png',
        '/images/figma/my/rank/master.png',
        '/images/figma/my/rank/gold.png',
        '/images/figma/my/rank/silver.png',
        '/images/figma/my/rank/bronze.png',
      ];

      return {
        name: rankNames[index] || 'Bronze',
        image: rankImages[index] || '/images/figma/my/rank/bronze.png',
        user: `${index + 1} ${stat.name}`,
      };
    });

    return (
      <div className="w-full max-w-full ">
        {/* Profile Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src="/images/figma/my/rank/ranking.png"
              alt="Profile"
              className="w-48 sm:w-64 md:w-80 h-auto object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Rank Cards Section */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8"
          id="rank-cards"
        >
          {rankCards.map((rank, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <img
                  src={rank.image}
                  alt={rank.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-blue-600 mb-2">{rank.name}</h4>
              <p className="text-xs sm:text-sm font-bold text-gray-800">{rank.user}</p>
            </div>
          ))}
        </div>

        {/* Game Statistics Table */}
        <div
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          id="rank-list"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Birth
                  </th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                    CPM
                  </th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gameStats.map((stat, index) => (
                  <tr
                    key={index}
                    className={`
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      ${stat.rank === 'Me' ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                      hover:bg-gray-100 transition-colors
                    `}
                  >
                    <td
                      className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${
                        stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'
                      }`}
                    >
                      {stat.rank}
                    </td>
                    <td
                      className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${
                        stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'
                      }`}
                    >
                      {stat.name}
                    </td>
                    <td
                      className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${
                        stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'
                      }`}
                    >
                      {stat.birth}
                    </td>
                    <td
                      className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${
                        stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'
                      }`}
                    >
                      {stat.score.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${
                        stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'
                      }`}
                    >
                      {stat.cpm}
                    </td>
                    <td
                      className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${
                        stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'
                      }`}
                    >
                      {stat.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Scores Section */}
        <div className="my-20">
          <SectionHeader title="View scores" className="mb-8" />

          {/* Score Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-20 mb-40">
            {/* Highest CPM Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Highest CPM</h4>
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {bestRecords?.highestCPM || 0}
                </div>
                <div className="text-sm text-gray-600">CPM</div>
                <div className="mt-3 text-sm text-gray-500">
                  Accuracy{' '}
                  <span className="font-medium text-gray-700">
                    {bestRecords?.bestAccuracy ? Math.round(bestRecords.bestAccuracy) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Max Combo Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Max Combo</h4>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="text-4xl font-bold text-orange-500">
                    {bestRecords?.highestCombo || 0}
                  </div>
                  <span className="text-orange-500 text-xl">🔥</span>
                </div>
                <div className="text-sm text-gray-600">Combo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Past Play Section */}
        <div className="my-20">
          <SectionHeader title="Past Play" className="mb-10" />

          {/* Section Title */}
          <p className="text-gray-700 text-2xl text-center my-20">Typing Game</p>

          {/* Past Play Statistics Table - Typing Game */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      CPM
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Combo
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {typingGameHistory.length > 0 ? (
                    typingGameHistory.map((game, index) => (
                      <tr
                        key={game.id}
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-gray-100 transition-colors`}
                      >
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {index + 1}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {game.score.toLocaleString()}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {game.cpm}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {game.combo}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {Math.round(game.accuracy)}%
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {game.createdAt instanceof Date
                            ? game.createdAt.toLocaleString()
                            : (game.createdAt as any)?.toDate?.()?.toLocaleString() ||
                              new Date(game.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                        No Typing Game records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section Title */}
          <p className="text-gray-700 text-2xl text-center my-20">Typing Sprint</p>

          {/* Past Play Statistics Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      CPM
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Combo
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sprintGameHistory.length > 0 ? (
                    sprintGameHistory.map((game, index) => (
                      <tr
                        key={game.id}
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-gray-100 transition-colors`}
                      >
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {index + 1}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {game.score.toLocaleString()}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {game.cpm}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {game.combo}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {Math.round(game.accuracy)}%
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800">
                          {game.createdAt instanceof Date
                            ? game.createdAt.toLocaleString()
                            : (game.createdAt as any)?.toDate?.()?.toLocaleString() ||
                              new Date(game.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                        No Sprint game history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBadges = () => {
    // 뱃지 카테고리 데이터 (활성화 상태 시뮬레이션)

    return (
      <div className="w-full max-w-full ">
        <div className="bg-[#05071c] rounded-xl shadow-lg border border-gray-800 p-6 sm:p-8">
          {/* Progress Summary */}
          <div className="my-8 pb-6">
            <div className="text-center space-y-2">
              <h4 className="text-lg font-semibold text-white">Achievement Progress</h4>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {badgeCategories.reduce(
                      (total, category) =>
                        total + category.badges.filter(badge => badge.active).length,
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-300">Earned</div>
                </div>
                <div className="text-gray-500">/</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-500">
                    {badgeCategories.reduce((total, category) => total + category.badges.length, 0)}
                  </div>
                  <div className="text-sm text-gray-300">Total</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (badgeCategories.reduce(
                        (total, category) =>
                          total + category.badges.filter(badge => badge.active).length,
                        0
                      ) /
                        badgeCategories.reduce(
                          (total, category) => total + category.badges.length,
                          0
                        )) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="">
            {badgeCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4 my-20">
                {/* Category Title */}
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{category.title}</h3>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {category.badges.map((badge, badgeIndex) => (
                    <div
                      key={badgeIndex}
                      className={`
            relative bg-[#05071c] rounded-xl shadow-md border border-gray-700 p-4 sm:p-6 text-center
            transition-transform hover:scale-105 hover:shadow-lg
            ${badge.active ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                `}
                    >
                      {/* Badge Image */}
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <img
                            src={`/images/figma/my/badge/${badge.id}${
                              badge.active ? '' : '_g'
                            }.png`}
                            alt={badge.name}
                            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                          />
                          {badge.active && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                          {!badge.active && (
                            <div className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-lg"></div>
                          )}
                        </div>
                      </div>

                      {/* Badge Info */}
                      <div className="space-y-2">
                        <h4
                          className={`text-base sm:text-lg font-bold ${
                            badge.active ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {badge.name}
                        </h4>
                        <p
                          className={`text-xs sm:text-sm ${
                            badge.active ? 'text-gray-300' : 'text-gray-500'
                          }`}
                        >
                          {badge.description}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-4">
                        <span
                          className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${badge.active ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}
            `}
                        >
                          {badge.active ? '✓ Earned' : 'Locked'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      <div className="container mx-auto px-4 py-6 sm:py-8 w-full max-w-full">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <SectionHeader title="My page" className="mb-3 sm:mb-4" />

          {/* Tab Navigation */}
          <div className="flex justify-center overflow-x-auto">
            <div className="inline-flex rounded-lg border border-blue-600 overflow-hidden min-w-0">
              <button
                onClick={() => setActiveTab('learning')}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-light transition-colors whitespace-nowrap ${
                  activeTab === 'learning'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Learning Stage
              </button>
              <button
                onClick={() => setActiveTab('game')}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-light transition-colors border-l border-blue-600 whitespace-nowrap ${
                  activeTab === 'game'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Game History
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-light transition-colors border-l border-blue-600 whitespace-nowrap ${
                  activeTab === 'badges'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Badges & Achievements
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto w-full ">
          {activeTab === 'learning' && renderLearningStage()}
          {activeTab === 'game' && renderGameHistory()}
          {activeTab === 'badges' && renderBadges()}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
