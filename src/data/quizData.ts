export interface QuizImage {
  id: string;
  imageUrl: string;
  answer: string;
  hint?: string;
}

export const quizImages: QuizImage[] = [
  {
    id: 'dog',
    imageUrl: '/images/quiz/quiz-sample-image.jpg',
    answer: 'DOG',
    hint: '충성스러운 반려동물'
  },
  {
    id: 'cat',
    imageUrl: '/images/quiz/quiz-sample-image.jpg',
    answer: 'CAT',
    hint: '야옹하고 우는 동물'
  },
  {
    id: 'sun',
    imageUrl: '/images/quiz/quiz-sample-image.jpg',
    answer: 'SUN',
    hint: '낮에 밝게 빛나는 것'
  },
  {
    id: 'tree',
    imageUrl: '/images/quiz/quiz-sample-image.jpg',
    answer: 'TREE',
    hint: '숲에서 자라는 큰 식물'
  },
  {
    id: 'book',
    imageUrl: '/images/quiz/quiz-sample-image.jpg',
    answer: 'BOOK',
    hint: '지식을 담은 물건'
  },
  {
    id: 'car',
    imageUrl: '/images/quiz/quiz-sample-image.jpg',
    answer: 'CAR',
    hint: '도로를 달리는 교통수단'
  },
  {
    id: 'bird',
    imageUrl: '/images/quiz/quiz-sample-image.jpg',
    answer: 'BIRD',
    hint: '하늘을 나는 동물'
  },
  {
    id: 'fish',
    imageUrl: '/images/quiz/quiz-sample-image.jpg',
    answer: 'FISH',
    hint: '물에서 사는 동물'
  }
];
