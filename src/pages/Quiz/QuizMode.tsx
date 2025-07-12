import React, { useState, useEffect } from 'react';
import { BRAILLE_ALPHABET, BRAILLE_NUMBERS, getDotsFromCharacter, generateBraillePattern, findCharacterFromDots } from '../../utils/braille';

interface QuizQuestion {
  id: number;
  type: 'text-to-braille' | 'braille-to-text';
  character: string;
  dots?: number[];
  options: string[];
  correct: string;
}

const QuizMode: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizType, setQuizType] = useState<'alphabet' | 'numbers' | 'mixed'>('alphabet');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const totalQuestions = 10;

  useEffect(() => {
    if (!quizComplete && questionCount === 0) {
      generateQuestion();
    }
  }, [quizType, difficulty]);

  useEffect(() => {
    if (currentQuestion && !quizComplete && !showResult) {
      setTimeLeft(timeLimit);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion, quizComplete, showResult, timeLimit]);

  const generateQuestion = () => {
    const characters = quizType === 'alphabet' 
      ? Object.keys(BRAILLE_ALPHABET)
      : quizType === 'numbers'
      ? Object.keys(BRAILLE_NUMBERS)
      : [...Object.keys(BRAILLE_ALPHABET), ...Object.keys(BRAILLE_NUMBERS)];

    const availableChars = difficulty === 'easy'
      ? characters.slice(0, 5)
      : difficulty === 'medium'
      ? characters.slice(0, 10)
      : characters;

    const character = availableChars[Math.floor(Math.random() * availableChars.length)];
    const dots = getDotsFromCharacter(character);
    const questionType = Math.random() > 0.5 ? 'text-to-braille' : 'braille-to-text';

    let options: string[] = [];
    let correct: string = '';

    if (questionType === 'text-to-braille') {
      // Show text, ask for braille pattern
      correct = dots ? generateBraillePattern(dots) : '';
      const wrongOptions = generateWrongBrailleOptions(character, availableChars);
      options = shuffleArray([correct, ...wrongOptions]).slice(0, 4);
    } else {
      // Show braille pattern, ask for text
      correct = character;
      const wrongOptions = availableChars
        .filter(c => c !== character)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      options = shuffleArray([correct, ...wrongOptions]);
    }

    const question: QuizQuestion = {
      id: questionCount + 1,
      type: questionType,
      character,
      dots,
      options,
      correct
    };

    setCurrentQuestion(question);
    setSelectedAnswer('');
    setShowResult(false);
    setLastAnswerCorrect(null);
  };

  const generateWrongBrailleOptions = (correctChar: string, availableChars: string[]): string[] => {
    const wrongChars = availableChars
      .filter(c => c !== correctChar)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return wrongChars.map(char => {
      const dots = getDotsFromCharacter(char);
      return dots ? generateBraillePattern(dots) : '⠀';
    });
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion?.correct;
    setLastAnswerCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);

      if (newQuestionCount >= totalQuestions) {
        setQuizComplete(true);
      } else {
        generateQuestion();
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    setLastAnswerCorrect(false);
    setShowResult(true);
    
    setTimeout(() => {
      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);

      if (newQuestionCount >= totalQuestions) {
        setQuizComplete(true);
      } else {
        generateQuestion();
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setScore(0);
    setQuestionCount(0);
    setQuizComplete(false);
    setShowResult(false);
    setLastAnswerCorrect(null);
    setTimeLeft(timeLimit);
  };

  const getScoreColor = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (quizComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
            <div className={`text-6xl font-bold mb-4 ${getScoreColor()}`}>
              {score}/{totalQuestions}
            </div>
            <p className="text-xl text-gray-600 mb-8">
              You scored {Math.round((score / totalQuestions) * 100)}%
            </p>
            
            <div className="space-y-4">
              {score === totalQuestions && (
                <p className="text-green-600 font-semibold">Perfect score! Excellent work! 🌟</p>
              )}
              {score >= totalQuestions * 0.8 && score < totalQuestions && (
                <p className="text-green-600 font-semibold">Great job! You're doing well! 👍</p>
              )}
              {score >= totalQuestions * 0.6 && score < totalQuestions * 0.8 && (
                <p className="text-yellow-600 font-semibold">Good effort! Keep practicing! 💪</p>
              )}
              {score < totalQuestions * 0.6 && (
                <p className="text-red-600 font-semibold">Keep practicing - you'll improve! 📚</p>
              )}
            </div>

            <button
              onClick={resetQuiz}
              className="mt-8 bg-primary-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-8">
            <div className="flex space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg"></div>
            </div>
          </div>
          <h1 className="text-4xl font-light text-gray-600 mb-4">Quiz Mode</h1>
          <p className="text-lg text-gray-600">Test your Braille knowledge</p>
        </div>

        {questionCount === 0 ? (
          /* Quiz Settings */
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Quiz Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['alphabet', 'numbers', 'mixed'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setQuizType(type)}
                      className={`p-4 rounded-lg border-2 font-semibold capitalize transition-all ${
                        quizType === type
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Difficulty</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-4 rounded-lg border-2 font-semibold capitalize transition-all ${
                        difficulty === level
                          ? 'bg-success-500 text-white border-success-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-success-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Time Limit (seconds)</label>
                <div className="grid grid-cols-3 gap-4">
                  {[15, 30, 60].map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimeLimit(time)}
                      className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                        timeLimit === time
                          ? 'bg-warning-500 text-white border-warning-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-warning-300'
                      }`}
                    >
                      {time}s
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setQuestionCount(0);
                  generateQuestion();
                }}
                className="w-full bg-primary-500 text-white py-4 rounded-lg text-xl font-semibold hover:bg-primary-600 transition-colors"
              >
                Start Quiz
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Question */
          currentQuestion && (
            <div className="space-y-8">
              {/* Progress and Timer */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-semibold">
                    Question {questionCount + 1} of {totalQuestions}
                  </div>
                  <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                    ⏰ {timeLeft}s
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((questionCount + 1) / totalQuestions) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right mt-2 text-sm text-gray-600">
                  Score: {score}/{questionCount}
                </div>
              </div>

              {/* Question */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  {currentQuestion.type === 'text-to-braille' ? (
                    <>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        What is the Braille pattern for this character?
                      </h2>
                      <div className="text-8xl font-bold text-primary-500 mb-4">
                        {currentQuestion.character}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        What character does this Braille pattern represent?
                      </h2>
                      <div className="text-8xl mb-4" style={{ fontFamily: 'monospace' }}>
                        {currentQuestion.dots ? generateBraillePattern(currentQuestion.dots) : '⠀'}
                      </div>
                    </>
                  )}
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !showResult && handleAnswer(option)}
                      disabled={showResult}
                      className={`p-6 rounded-lg border-2 text-2xl font-bold transition-all ${
                        showResult
                          ? option === currentQuestion.correct
                            ? 'bg-green-500 text-white border-green-500'
                            : option === selectedAnswer
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-gray-100 text-gray-500 border-gray-300'
                          : selectedAnswer === option
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      {currentQuestion.type === 'text-to-braille' ? (
                        <span style={{ fontFamily: 'monospace' }}>{option}</span>
                      ) : (
                        option
                      )}
                    </button>
                  ))}
                </div>

                {/* Result Feedback */}
                {showResult && (
                  <div className="mt-6 text-center">
                    {lastAnswerCorrect ? (
                      <div className="text-green-600 text-xl font-semibold">
                        ✅ Correct! Well done!
                      </div>
                    ) : (
                      <div className="text-red-600 text-xl font-semibold">
                        ❌ {selectedAnswer ? 'Incorrect.' : 'Time up!'} The correct answer was: {currentQuestion.correct}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default QuizMode;
