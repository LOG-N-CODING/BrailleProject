import { useState, useEffect, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc as firestoreDoc,
} from 'firebase/firestore';
import { storage, db } from '../../../firebase/config';
import { useCollection } from '../../../utils/useCollections';

type Quiz = {
  id: string;
  type: 'image' | 'math';
  imageUrl?: string;
  word?: string;
  formula?: string;
  answer?: string;
  difficulty: string;
  hint?: string;
};

export function QuizList() {
  const [quizType, setQuizType] = useState<'image' | 'math'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [word, setWord] = useState('');
  const [formula, setFormula] = useState('');
  const [answer, setAnswer] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [hint, setHint] = useState('');
  const quizzes = useCollection<Quiz>('quizzes');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quizType === 'image' && file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview('');
    }
  }, [file, quizType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quizType === 'image') {
      if (!file || !word) return;
      const storageRef = ref(storage, `quiz-images/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        snapshot => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        console.error,
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'quizzes'), {
            type: 'image',
            imageUrl,
            word,
            hint,
            createdAt: serverTimestamp(),
          });
          // 상태 리셋
          setFile(null);
          setWord('');
          setDifficulty('easy');
          setHint('');
          setUploadProgress(0);
          // input 필드 값 클리어
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      );
    } else {
      if (!formula || !answer) return;
      await addDoc(collection(db, 'quizzes'), {
        type: 'math',
        question: formula,
        answer,
        hint,
        difficulty,
        createdAt: serverTimestamp(),
      });
      setFormula('');
      setAnswer('');
      setDifficulty('easy');
      setHint('');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 이 퀴즈를 삭제하시겠습니까?')) {
      await deleteDoc(firestoreDoc(db, 'quizzes', id));
    }
  };

  // 현재 선택된 타입에 맞춰 필터링
  const filteredQuizzes = quizzes.filter(q => q.type === quizType);

  return (
    <div className="w-[70%] mx-auto bg-white shadow rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">퀴즈 등록</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="image"
              checked={quizType === 'image'}
              onChange={() => setQuizType('image')}
              className="form-radio"
            />
            <span>이미지 퀴즈</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="math"
              checked={quizType === 'math'}
              onChange={() => setQuizType('math')}
              className="form-radio"
            />
            <span>계산 퀴즈</span>
          </label>
        </div>

        {quizType === 'image' ? (
          <div className="md:grid md:grid-cols-2 md:gap-6 items-start">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">이미지 파일</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 bg-blue-500" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
            <div className="flex justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="썸네일 미리보기"
                  className="w-80 h-80 object-cover rounded-lg shadow"
                />
              ) : (
                <div className="w-80 h-80 bg-gray-100 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400">이미지 미리보기</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정답(단어)</label>
              <input
                type="text"
                value={word}
                onChange={e => {
                  // 영문자(A–Z)만 남기고, 전부 대문자로 변환
                  const englishOnly = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                  setWord(englishOnly);
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">힌트</label>
              <input
                type="text"
                value={hint}
                onChange={e => setHint(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="힌트를 입력하세요"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수식</label>
              <input
                type="text"
                value={formula}
                onChange={e => setFormula(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 2+3*4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">답</label>
              <input
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">힌트</label>
              <input
                type="text"
                value={hint}
                onChange={e => setHint(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="힌트를 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="easy">쉬움</option>
                <option value="medium">보통</option>
                <option value="hard">어려움</option>
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          퀴즈 등록
        </button>
      </form>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">등록된 퀴즈 관리</h3>
        <ul className="space-y-4">
          {filteredQuizzes.map(q => (
            <li key={q.id} className="flex items-center space-x-4">
              {q.type === 'image' ? (
                <img src={q.imageUrl!} alt={q.word} className="w-24 h-24 object-cover rounded" />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-lg">
                    {q.formula} = {q.answer}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium">{q.word}</div>
                {q.hint && <div className="text-sm text-gray-500">힌트: {q.hint}</div>}
                <div className="text-sm text-gray-500">난이도: {q.difficulty}</div>
              </div>
              <button
                onClick={() => handleDelete(q.id)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
