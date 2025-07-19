import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface QuizCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

const quizCards: QuizCard[] = [
  {
    id: 'image-to-braille',
    title: 'Image to Braille',
    description: 'Quiz where you look at images and input the correct words in Braille',
    icon: '🖼️',
    route: '/quiz/image-to-braille',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'math-quiz',
    title: 'Math Quiz',
    description: 'Quiz where you solve math problems using Braille',
    icon: '🧮',
    route: '/quiz/math',
    color: 'from-green-400 to-green-600'
  },
];

const QuizIndex: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (route: string, available: boolean = true) => {
    if (available) {
      navigate(route);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-light text-gray-800 mb-4">
            Quiz Zone
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test your Braille skills through various quizzes!
          </p>
        </motion.div>

        {/* 퀴즈 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quizCards.map((card, index) => {
            const isAvailable = card.id === 'image-to-braille' || card.id === 'math-quiz';
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleCardClick(card.route, isAvailable)}
                className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isAvailable 
                    ? 'cursor-pointer hover:shadow-2xl' 
                    : 'cursor-not-allowed opacity-60'
                }`}
              >
                {/* 배경 그라디언트 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color}`} />
                
                {/* 컨텐츠 */}
                <div className="relative p-8 text-white">
                  <div className="text-6xl mb-4">{card.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3">{card.title}</h3>
                  <p className="text-lg opacity-90 leading-relaxed mb-6">
                    {card.description}
                  </p>
                  
                  {/* 상태 표시 */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isAvailable 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : 'bg-gray-500 bg-opacity-50 text-gray-200'
                    }`}>
                      {isAvailable ? 'Available' : 'Coming Soon'}
                    </span>
                    
                    {isAvailable && (
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-2xl"
                      >
                        →
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* 호버 효과 */}
                {isAvailable && (
                  <motion.div
                    className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"
                    whileHover={{ opacity: 0.1 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 추가 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              How to Use Quizzes
            </h3>
            <div className="text-left space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Click on your desired quiz card to start</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Connect your Braille input device or use the on-screen keyboard</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Solve problems and check your score</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold">4.</span>
                <span>Improve your Braille skills through repeated practice</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizIndex;
