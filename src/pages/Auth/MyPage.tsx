import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getLearningStats, getUserLearningProgress } from '../../utils/learningProgress';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../../components/UI';

interface LearningStats {
  letters: { completed: number; total: number };
  numbers: { completed: number; total: number };
  words: { completed: number; total: number };
  phrases: { completed: number; total: number };
  overall: { completed: number; total: number };
}

interface CategoryProgress {
  [category: string]: { [item: string]: number };
}

const MyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'learning' | 'game' | 'badges'>('learning');
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [wordCategories, setWordCategories] = useState<CategoryProgress>({});
  const [phraseCategories, setPhraseCategories] = useState<CategoryProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserStats();
  }, [user, navigate]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [learningStats, userProgress] = await Promise.all([
        getLearningStats(user),
        getUserLearningProgress(user)
      ]);

      if (learningStats) {
        setStats(learningStats);
      }

      // 카테고리별 진행도 설정
      setWordCategories(userProgress.words || {});
      setPhraseCategories(userProgress.phrases || {});
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-light text-gray-800">Words</h3>
            <span className="text-2xl font-light text-gray-800">
              {stats?.words.completed || 0}/{stats?.words.total || 200}
            </span>
          </div>
        </div>

        {/* Word Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(wordCategories).map(([category, words]) => {
            const completed = Object.values(words).filter(status => status === 1).length;
            const total = Object.keys(words).length;
            return (
              <div key={category} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h4 className="text-sm font-light text-gray-800 text-center mb-2 leading-tight">
                  {category}
                </h4>
                <p className="text-sm font-light text-gray-800 text-center">
                  {completed}/{total}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phrases Section */}
      <div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-light text-gray-800">Phrases</h3>
            <span className="text-2xl font-light text-gray-800">
              {stats?.phrases.completed || 0}/{stats?.phrases.total || 50}
            </span>
          </div>
        </div>

        {/* Phrase Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(phraseCategories).map(([category, phrases]) => {
            const completed = Object.values(phrases).filter(status => status === 1).length;
            const total = Object.keys(phrases).length;
            return (
              <div key={category} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h4 className="text-sm font-light text-gray-800 text-center mb-2 leading-tight">
                  {category}
                </h4>
                <p className="text-sm font-light text-gray-800 text-center">
                  {completed}/{total}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderGameHistory = () => {
    // 샘플 게임 통계 데이터
    const gameStats = [
      { rank: 6, name: 'Emma', birth: '1995', score: '4200', cpm: '28', accuracy: '95%' },
      { rank: 7, name: 'Oliver', birth: '1998', score: '3800', cpm: '25', accuracy: '88%' },
      { rank: 8, name: 'Sophia', birth: '1993', score: '3500', cpm: '24', accuracy: '92%' },
      { rank: 9, name: 'Lucas', birth: '1997', score: '3200', cpm: '22', accuracy: '85%' },
      { rank: 'Me', name: 'Ahn', birth: '2009', score: '5500', cpm: '32', accuracy: '100%' }
    ];

    const rankCards = [
      { name: 'Challenger', image: '/images/figma/my/rank/challenger.png', user: '1 John' },
      { name: 'Master', image: '/images/figma/my/rank/master.png', user: '2 Mia' },
      { name: 'Gold', image: '/images/figma/my/rank/gold.png', user: '3 Liam' },
      { name: 'Silver', image: '/images/figma/my/rank/silver.png', user: '4 Emma' },
      { name: 'Bronze', image: '/images/figma/my/rank/bronze.png', user: '5 Noah' }
    ];

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
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
              <h4 className="text-sm sm:text-base font-bold text-blue-600 mb-2">
                {rank.name}
              </h4>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {rank.user}
              </p>
            </div>
          ))}
        </div>

        {/* Game Statistics Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
                    <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                      {stat.rank}
                    </td>
                    <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                      {stat.name}
                    </td>
                    <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                      {stat.birth}
                    </td>
                    <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                      {stat.score}
                    </td>
                    <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                      {stat.cpm}
                    </td>
                    <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                      {stat.accuracy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Scores Section */}
        <div className="my-20">
            <SectionHeader 
            title="View scores" 
            className="mb-8"
            />

          {/* Score Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-20 mb-40">
            {/* Highest CPM Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Highest CPM</h4>
                <div className="text-4xl font-bold text-blue-600 mb-1">88</div>
                <div className="text-sm text-gray-600">CPM</div>
                <div className="mt-3 text-sm text-gray-500">
                  정확도 <span className="font-medium text-gray-700">100%</span>
                </div>
              </div>
            </div>

            {/* Max Combo Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Max Combo</h4>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="text-4xl font-bold text-orange-500">12</div>
                  <span className="text-orange-500 text-xl">🔥</span>
                </div>
                <div className="text-sm text-gray-600">Combo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Past Play Section */}
        <div className="my-20">
          <SectionHeader 
              title="Past Play" 
              className="mb-10"
              />

          {/* Section Title */}
          <p className="text-gray-700 text-2xl text-center my-20">Typing Game</p>

          {/* Past Play Statistics Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
                  {/* Sample past play data */}
                  {[
                    { rank: '1', name: 'John', birth: '2010-05-12', score: '50,000', cpm: '120', accuracy: '99%' },
                    { rank: '2', name: 'Mia', birth: '2010-05-12', score: '32,000', cpm: '88', accuracy: '99%' },
                    { rank: '3', name: 'Liam', birth: '2010-05-12', score: '28,000', cpm: '75', accuracy: '98%' },
                    { rank: '4', name: 'Emma', birth: '2010-05-12', score: '25,000', cpm: '68', accuracy: '97%' },
                    { rank: '5', name: 'Noah', birth: '2010-05-12', score: '10,000', cpm: '55', accuracy: '95%' },
                    { rank: 'Me', name: 'Ahn', birth: '2009', score: '5,500', cpm: '32', accuracy: '100%' },
                  ].map((stat, index) => (
                    <tr 
                      key={index} 
                      className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        ${stat.rank === 'Me' ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                        hover:bg-gray-100 transition-colors
                      `}
                    >
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.rank}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.name}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.birth}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.score}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.cpm}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.accuracy}
                      </td>
                    </tr>
                  ))}
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
                  {/* Sample past play data */}
                  {[
                    { rank: '1', name: 'John', birth: '2010-05-12', score: '50,000', cpm: '120', accuracy: '99%' },
                    { rank: '2', name: 'Mia', birth: '2010-05-12', score: '32,000', cpm: '88', accuracy: '99%' },
                    { rank: '3', name: 'Liam', birth: '2010-05-12', score: '28,000', cpm: '75', accuracy: '98%' },
                    { rank: '4', name: 'Emma', birth: '2010-05-12', score: '25,000', cpm: '68', accuracy: '97%' },
                    { rank: '5', name: 'Noah', birth: '2010-05-12', score: '10,000', cpm: '55', accuracy: '95%' },
                    { rank: 'Me', name: 'Ahn', birth: '2009', score: '5,500', cpm: '32', accuracy: '100%' },
                  ].map((stat, index) => (
                    <tr 
                      key={index} 
                      className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        ${stat.rank === 'Me' ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                        hover:bg-gray-100 transition-colors
                      `}
                    >
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.rank}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.name}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.birth}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.score}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.cpm}
                      </td>
                      <td className={`px-3 py-4 whitespace-nowrap text-xs sm:text-sm ${stat.rank === 'Me' ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                        {stat.accuracy}
                      </td>
                    </tr>
                  ))}
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
    const badgeCategories = [
      {
        title: "Start",
        badges: [
          { id: "s1", name: "Learn Start", active: true, description: "Complete your first learning session" },
          { id: "s2", name: "All Master Badge", active: false, description: "Master all learning categories" },
          { id: "s3", name: "All Legend Badge", active: false, description: "Become a legend in all areas" }
        ]
      },
      {
        title: "Combo Master",
        badges: [
          { id: "combo1", name: "Achieve 2 combos", active: true, description: "Get 2 consecutive correct answers" },
          { id: "combo2", name: "Achieve 5 combos", active: true, description: "Get 5 consecutive correct answers" },
          { id: "combo3", name: "Achieve 10 combos", active: false, description: "Get 10 consecutive correct answers" }
        ]
      },
      {
        title: "Pro Gamer",
        badges: [
          { id: "game1", name: "Play 1 game", active: true, description: "Complete your first game" },
          { id: "game2", name: "Play 10 games", active: false, description: "Complete 10 games" },
          { id: "game3", name: "Play 50 games", active: false, description: "Complete 50 games" }
        ]
      },
      {
        title: "Honor Student",
        badges: [
          { id: "learn1", name: "Reach 30% learning progress", active: true, description: "Complete 30% of all learning content" },
          { id: "learn2", name: "Reach 60% learning progress", active: false, description: "Complete 60% of all learning content" },
          { id: "learn3", name: "Reach 100% learning progress", active: false, description: "Complete all learning content" }
        ]
      },
      {
        title: "Fast Typist",
        badges: [
          { id: "fast1", name: "Reach 20 CPM", active: true, description: "Achieve 20 characters per minute" },
          { id: "fast2", name: "Reach 40 CPM", active: false, description: "Achieve 40 characters per minute" },
          { id: "fast3", name: "Reach 100 CPM", active: false, description: "Achieve 100 characters per minute" }
        ]
      }
    ];

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
              {badgeCategories.reduce((total, category) => 
                total + category.badges.filter(badge => badge.active).length, 0
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
              width: `${(badgeCategories.reduce((total, category) => 
                total + category.badges.filter(badge => badge.active).length, 0
              ) / badgeCategories.reduce((total, category) => total + category.badges.length, 0)) * 100}%`
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
                src={`/images/figma/my/badge/${badge.id}${badge.active ? '' : '_g'}.png`}
                alt={badge.name}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
              />
              {badge.active && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
            <h4 className={`text-base sm:text-lg font-bold ${badge.active ? 'text-white' : 'text-gray-500'}`}>
              {badge.name}
            </h4>
            <p className={`text-xs sm:text-sm ${badge.active ? 'text-gray-300' : 'text-gray-500'}`}>
              {badge.description}
            </p>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${badge.active 
                ? 'bg-green-900 text-green-300' 
                : 'bg-gray-800 text-gray-400'}
            `}>
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
            <SectionHeader 
            title="My page" 
            className="mb-3 sm:mb-4"
            />

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
