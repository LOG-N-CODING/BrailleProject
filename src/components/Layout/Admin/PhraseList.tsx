import { useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useCollection } from '../../../utils/useCollections';

type Category = { id: string; name: string };
type Phrase = { id: string; category: string; content: string };

export function PhraseList() {
  // Firestore에서 카테고리, 숙어 로드
  const phraseCategories = useCollection<Category>('phraseCategories');
  const phrases = useCollection<Phrase>('phrases');

  // 로컬 상태
  const [newCat, setNewCat] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [newPhrase, setNewPhrase] = useState('');
  const [catError, setCatError] = useState('');
  const [phraseError, setPhraseError] = useState('');

  // 선택된 카테고리의 숙어 개수
  const countInCat = phrases.filter(p => p.category === selectedCat).length;

  // 카테고리 추가 핸들러
  const handleAddCategory = async () => {
    setCatError('');
    if (!newCat.trim()) return;
    if (phraseCategories.length >= 5) {
      setCatError('카테고리는 최대 5개까지 등록 가능합니다.');
      return;
    }
    if (phraseCategories.some(c => c.name === newCat.trim())) {
      setCatError('이미 존재하는 카테고리입니다.');
      return;
    }
    await addDoc(collection(db, 'phraseCategories'), {
      name: newCat.trim(),
      createdAt: serverTimestamp(),
    });
    setNewCat('');
  };

  // 카테고리 삭제: 연관된 숙어도 함께 삭제
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`'${catName}' 카테고리와 모든 숙어를 삭제하시겠습니까?`)) return;
    // 배치로 삭제
    const batch = writeBatch(db);
    // 1) 카테고리 문서
    batch.delete(doc(db, 'phraseCategories', catId));
    // 2) 해당 카테고리의 모든 숙어
    phrases
      .filter(p => p.category === catName)
      .forEach(p => batch.delete(doc(db, 'phrases', p.id)));
    await batch.commit();
    if (selectedCat === catName) setSelectedCat('');
  };

  // 숙어 추가 핸들러
  const handleAddPhrase = async () => {
    setPhraseError('');
    if (!selectedCat) {
      setPhraseError('먼저 카테고리를 선택해주세요.');
      return;
    }
    if (!newPhrase.trim()) return;
    if (countInCat >= 10) {
      setPhraseError('이 카테고리에는 최대 10개의 숙어만 등록할 수 있습니다.');
      return;
    }
    if (
      phrases.some(
        p =>
          p.category === selectedCat && p.content.toLowerCase() === newPhrase.trim().toLowerCase()
      )
    ) {
      setPhraseError('이미 등록된 숙어입니다.');
      return;
    }
    await addDoc(collection(db, 'phrases'), {
      category: selectedCat,
      content: newPhrase.trim(),
      createdAt: serverTimestamp(),
    });
    setNewPhrase('');
  };

  // 숙어 삭제
  const handleDeletePhrase = async (id: string) => {
    await deleteDoc(doc(db, 'phrases', id));
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">숙어 관리</h2>

      {/* 카테고리 관리 */}
      <section className="mb-8">
        <h3 className="text-lg font-medium mb-2">카테고리 ({phraseCategories.length}/5)</h3>
        <div className="flex items-center space-x-2 mb-2">
          <input
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            placeholder="새 카테고리 이름"
            className="flex-1 border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddCategory}
            className={`px-4 py-2 rounded ${
              phraseCategories.length >= 5 || !newCat.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={phraseCategories.length >= 5 || !newCat.trim()}
          >
            추가
          </button>
        </div>
        {catError && <p className="text-red-500 mb-2">{catError}</p>}

        <div className="flex flex-wrap gap-2">
          {phraseCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.name)}
              className={`flex items-center space-x-1 border px-3 py-1 rounded-full transition ${
                selectedCat === cat.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span>{cat.name}</span>
              {/* 🗑️ 이모지로 삭제 */}
              <span
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id, cat.name);
                }}
                className="ml-1 cursor-pointer text-gray-600 hover:text-red-600"
              >
                🗑️
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 숙어 추가 폼 */}
      <section className="mb-8">
        <h3 className="text-lg font-medium mb-2">숙어 추가 ({countInCat}/10)</h3>
        <div className="flex items-start space-x-2">
          <input
            value={newPhrase}
            onChange={e => setNewPhrase(e.target.value)}
            placeholder="숙어 내용을 입력하세요"
            className="flex-1 border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddPhrase}
            className={`px-4 py-2 rounded ${
              !newPhrase.trim() || !selectedCat || countInCat >= 10
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={!newPhrase.trim() || !selectedCat || countInCat >= 10}
          >
            추가
          </button>
        </div>
        {phraseError && <p className="text-red-500 mt-2">{phraseError}</p>}
        {!selectedCat && <p className="text-gray-500 mt-2">먼저 위에서 카테고리를 선택해주세요.</p>}
      </section>

      {/* 등록된 숙어 목록 */}
      <section>
        <h3 className="text-lg font-medium mb-2">등록된 숙어</h3>
        {selectedCat ? (
          phrases.filter(p => p.category === selectedCat).length > 0 ? (
            <ul className="space-y-2">
              {phrases
                .filter(p => p.category === selectedCat)
                .map(p => (
                  <li key={p.id} className="flex justify-between items-center border-b py-2">
                    <span>{p.content}</span>
                    {/* 🗑️ 이모지로 삭제 */}
                    <span
                      onClick={() => handleDeletePhrase(p.id)}
                      className="cursor-pointer text-gray-600 hover:text-red-600"
                    >
                      🗑️
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">등록된 숙어가 없습니다.</p>
          )
        ) : (
          <p className="text-gray-500">카테고리를 선택해주세요.</p>
        )}
      </section>
    </div>
  );
}
