export interface MathQuestion {
  id: string;
  question: string;
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export const mathQuestions: MathQuestion[] = [
  // Easy questions (1-digit answers)
  {
    id: 'easy_1',
    question: '3 + 2 = ?',
    answer: 5,
    difficulty: 'easy',
    hint: '3개에 2개를 더하면?'
  },
  {
    id: 'easy_2',
    question: '8 - 3 = ?',
    answer: 5,
    difficulty: 'easy',
    hint: '8개에서 3개를 빼면?'
  },
  {
    id: 'easy_3',
    question: '2 × 3 = ?',
    answer: 6,
    difficulty: 'easy',
    hint: '2를 3번 더하면?'
  },
  {
    id: 'easy_4',
    question: '9 ÷ 3 = ?',
    answer: 3,
    difficulty: 'easy',
    hint: '9를 3개로 나누면?'
  },
  {
    id: 'easy_5',
    question: '4 + 4 = ?',
    answer: 8,
    difficulty: 'easy',
    hint: '4개에 4개를 더하면?'
  },
  
  // Medium questions (2-digit answers)
  {
    id: 'medium_1',
    question: '12 + 8 = ?',
    answer: 20,
    difficulty: 'medium',
    hint: '12에 8을 더하면?'
  },
  {
    id: 'medium_2',
    question: '25 - 10 = ?',
    answer: 15,
    difficulty: 'medium',
    hint: '25에서 10을 빼면?'
  },
  {
    id: 'medium_3',
    question: '6 × 4 = ?',
    answer: 24,
    difficulty: 'medium',
    hint: '6을 4번 곱하면?'
  },
  {
    id: 'medium_4',
    question: '36 ÷ 6 = ?',
    answer: 6,
    difficulty: 'medium',
    hint: '36을 6으로 나누면?'
  },
  {
    id: 'medium_5',
    question: '15 + 7 = ?',
    answer: 22,
    difficulty: 'medium',
    hint: '15에 7을 더하면?'
  },
  
  // Hard questions (with order of operations)
  {
    id: 'hard_1',
    question: '10 + 5 × 2 = ?',
    answer: 20,
    difficulty: 'hard',
    hint: '곱셈을 먼저 계산하세요!'
  },
  {
    id: 'hard_2',
    question: '20 - 8 ÷ 2 = ?',
    answer: 16,
    difficulty: 'hard',
    hint: '나눗셈을 먼저 계산하세요!'
  },
  {
    id: 'hard_3',
    question: '3 × 4 + 5 = ?',
    answer: 17,
    difficulty: 'hard',
    hint: '곱셈을 먼저 계산하세요!'
  },
  {
    id: 'hard_4',
    question: '24 ÷ 4 - 2 = ?',
    answer: 4,
    difficulty: 'hard',
    hint: '나눗셈을 먼저 계산하세요!'
  },
  {
    id: 'hard_5',
    question: '5 + 3 × 2 - 1 = ?',
    answer: 10,
    difficulty: 'hard',
    hint: '연산 순서를 잘 생각해보세요!'
  }
];

export const getQuestionsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): MathQuestion[] => {
  return mathQuestions.filter(q => q.difficulty === difficulty);
};

export const getRandomQuestion = (difficulty?: 'easy' | 'medium' | 'hard'): MathQuestion => {
  const questions = difficulty ? getQuestionsByDifficulty(difficulty) : mathQuestions;
  return questions[Math.floor(Math.random() * questions.length)];
};
