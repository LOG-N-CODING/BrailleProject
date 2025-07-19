import {
  addDoc,
  collection,
  serverTimestamp,
  deleteDoc,
  doc as firestoreDoc,
} from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../../../firebase/config';
import { useCollection } from '../../../utils/useCollections';

type Word = {
  id: string;
  category: string;
  content: string;
};

export function WordList() {
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const words = useCollection<Word>('words');

  // 카테고리별 그룹핑
  const groupedWords = words.reduce((acc, w) => {
    if (!acc[w.category]) acc[w.category] = [];
    acc[w.category].push(w);
    return acc;
  }, {} as Record<string, Word[]>);

  const distinctCategoryCount = Object.keys(groupedWords).length;
  const isNewCategory = category && !groupedWords[category];
  const wordCountInCategory = groupedWords[category]?.length || 0;
  const isDuplicate = !!groupedWords[category]?.some(w => w.content === content);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !content) return;

    // 같은 카테고리에 같은 단어 중복 방지
    if (isDuplicate) {
      alert(`"${content}" 단어는 이미 "${category}" 카테고리에 등록되어 있습니다.`);
      return;
    }

    // 카테고리 개수 제한
    if (isNewCategory && distinctCategoryCount >= 10) {
      alert('카테고리는 최대 10개까지 등록 가능합니다.');
      return;
    }
    // 단어 개수 제한
    if (wordCountInCategory >= 20) {
      alert(`"${category}" 카테고리에는 최대 20개의 단어만 등록 가능합니다.`);
      return;
    }
    // 2) 로컬 폼 값 비우기 → 이후 렌더링에서 isDuplicate false
    const wordToAdd = content.trim();
    setCategory('');
    setContent('');

    // 3) DB 쓰기
    await addDoc(collection(db, 'words'), {
      category,
      content: wordToAdd,
      createdAt: serverTimestamp(),
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 이 단어를 삭제하시겠습니까?')) {
      await deleteDoc(firestoreDoc(db, 'words', id));
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    const items = groupedWords[cat];
    if (!items?.length) return;
    if (window.confirm(`정말 "${cat}" 카테고리와 모든 단어를 삭제하시겠습니까?`)) {
      await Promise.all(items.map(w => deleteDoc(firestoreDoc(db, 'words', w.id))));
      if (selectedCategory === cat) setSelectedCategory('');
    }
  };

  // 선택된 카테고리의 단어 목록
  const displayedWords = selectedCategory ? groupedWords[selectedCategory] || [] : [];

  // Add 버튼 활성화 여부
  const canAdd =
    !!category &&
    !!content &&
    (!isNewCategory || distinctCategoryCount < 10) &&
    wordCountInCategory < 20 &&
    !isDuplicate;

  return (
    <div className="w-[70%] mx-auto bg-white shadow rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">단어 관리</h2>
      <form onSubmit={handleAdd} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value.trim())}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="예: noun, verb"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value.trim())}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="단어를 입력하세요"
            required
          />
          {isDuplicate && (
            <p className="text-red-500 text-sm mt-1">
              "{content}" 단어는 이미 "{category}" 카테고리에 등록되어 있습니다.
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!canAdd}
          className={`w-full py-3 text-white font-semibold rounded-lg transition ${
            canAdd ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          단어 추가
        </button>
      </form>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">카테고리 선택</h3>
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          {Object.keys(groupedWords).map(cat => (
            <div key={cat} className="flex items-center space-x-1">
              <button
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
              <button
                onClick={() => handleDeleteCategory(cat)}
                title="카테고리 삭제"
                className="text-red-500 hover:text-red-600"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {selectedCategory && (
          <>
            <h4 className="text-lg font-medium text-gray-800 mb-2">
              {selectedCategory} 카테고리 단어
            </h4>
            <ul className="space-y-3">
              {displayedWords.map(w => (
                <li key={w.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <div className="font-medium">{w.content}</div>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
