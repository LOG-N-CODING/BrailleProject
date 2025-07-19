import { writeBatch, collection, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const wordsData: Record<string, string[]> = {
  'School & Education': [
    'subject',
    'homework',
    'classroom',
    'teacher',
    'student',
    'uniform',
    'blackboard',
    'pencil',
    'eraser',
    'ruler',
    'exam',
    'grade',
    'notebook',
    'lesson',
    'test',
    'answer',
    'question',
    'textbook',
    'desk',
    'schedule',
  ],
  'Food & Drink': [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
    'fruit',
    'vegetable',
    'bread',
    'rice',
    'chicken',
    'beef',
    'water',
    'juice',
    'milk',
    'egg',
    'soup',
    'cheese',
    'salad',
    'sandwich',
    'ice cream',
    'hamburger',
  ],
  Animals: [
    'dog',
    'cat',
    'rabbit',
    'tiger',
    'lion',
    'bear',
    'monkey',
    'elephant',
    'horse',
    'cow',
    'pig',
    'goat',
    'fox',
    'bird',
    'chicken',
    'duck',
    'snake',
    'fish',
    'wolf',
    'deer',
  ],
  'Weather & Seasons': [
    'sunny',
    'cloudy',
    'rainy',
    'snowy',
    'stormy',
    'windy',
    'hot',
    'cold',
    'warm',
    'cool',
    'spring',
    'summer',
    'fall',
    'winter',
    'thunder',
    'lightning',
    'temperature',
    'forecast',
    'climate',
    'foggy',
  ],
  'Feelings & Emotions': [
    'happy',
    'sad',
    'angry',
    'excited',
    'tired',
    'scared',
    'nervous',
    'surprised',
    'bored',
    'lonely',
    'proud',
    'shy',
    'jealous',
    'calm',
    'worried',
    'brave',
    'kind',
    'polite',
    'thankful',
    'upset',
  ],
  'Hobbies & Leisure': [
    'music',
    'dance',
    'drawing',
    'painting',
    'singing',
    'reading',
    'writing',
    'cooking',
    'baking',
    'fishing',
    'hiking',
    'swimming',
    'cycling',
    'jogging',
    'photography',
    'gaming',
    'camping',
    'traveling',
    'playing',
    'crafting',
  ],
  'Daily Activities': [
    'wake',
    'sleep',
    'eat',
    'brush',
    'wash',
    'go',
    'come',
    'study',
    'work',
    'walk',
    'run',
    'sit',
    'stand',
    'read',
    'write',
    'listen',
    'talk',
    'clean',
    'cook',
    'play',
  ],
  Places: [
    'school',
    'home',
    'park',
    'hospital',
    'library',
    'supermarket',
    'restaurant',
    'zoo',
    'museum',
    'bank',
    'post office',
    'airport',
    'station',
    'store',
    'beach',
    'mountain',
    'theater',
    'hotel',
    'church',
    'playground',
  ],
  'Clothes & Fashion': [
    'shirt',
    'pants',
    'dress',
    'skirt',
    'socks',
    'shoes',
    'jacket',
    'coat',
    'sweater',
    'gloves',
    'hat',
    'cap',
    'scarf',
    'belt',
    'jeans',
    'boots',
    'uniform',
    'pajamas',
    'sandals',
    'T-shirt',
  ],
  'Technology & Gadgets': [
    'phone',
    'tablet',
    'computer',
    'laptop',
    'keyboard',
    'mouse',
    'screen',
    'camera',
    'TV',
    'radio',
    'game',
    'charger',
    'battery',
    'speaker',
    'printer',
    'app',
    'email',
    'internet',
    'website',
    'robot',
  ],
};

const phraseData: Record<string, string[]> = {
  '일상 표현 (Daily)': [
    'get up',
    'go to bed',
    'take a shower',
    'brush my teeth',
    'go to school',
    'have breakfast',
    'do homework',
    'hang out',
    'get dressed',
    'come home',
  ],
  '감정 & 상태 (Feelings)': [
    'be tired',
    'feel sick',
    'be happy',
    'be bored',
    'be angry',
    'be hungry',
    'be excited',
    'be scared',
    'be nervous',
    'be surprised',
  ],
  '시간/빈도 표현 (Time)': [
    'every day',
    'in the morning',
    'at night',
    'once a week',
    'twice a day',
    'after school',
    'on weekends',
    'from time to time',
    'all the time',
    'right now',
  ],
  '학교생활 (School)': [
    'be late for school',
    'study hard',
    'take a test',
    'get good grades',
    'ask a question',
    'raise your hand',
    'work in groups',
    'listen to the teacher',
    'read a book',
    'write an essay',
  ],
  '기초 동사구 (Basic)': [
    'turn on',
    'turn off',
    'look at',
    'look for',
    'get in',
    'get out',
    'put on',
    'take off',
    'pick up',
    'give up',
  ],
};

const wordsImportAll = async () => {
  const wordsBatch = writeBatch(db);
  for (const [category, words] of Object.entries(wordsData)) {
    for (const w of words) {
      const ref = doc(collection(db, 'words')); // auto ID
      wordsBatch.set(ref, {
        category,
        content: w,
        createdAt: serverTimestamp(),
      });
    }
  }
  await wordsBatch.commit();
  alert('테스트용 단어 일괄 등록 완료!');
};

const wordsDeleteAll = async () => {
  if (!window.confirm('정말 모든 단어를 삭제하시겠습니까?')) return;
  const snap = await getDocs(collection(db, 'words'));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  alert('모든 단어 삭제 완료!');
};

const phraseImportAll = async () => {
  // 1) 카테고리 배치
  let catBatch = writeBatch(db);
  for (const catName of Object.keys(phraseData)) {
    const catRef = doc(collection(db, 'phraseCategories'));
    catBatch.set(catRef, { name: catName, createdAt: serverTimestamp() });
  }
  await catBatch.commit();

  // 2) 숙어 배치 (500건 제한 대비)
  let phraseBatch = writeBatch(db);
  let opCount = 0;
  for (const [catName, list] of Object.entries(phraseData)) {
    for (const content of list) {
      const ref = doc(collection(db, 'phrases'));
      phraseBatch.set(ref, { category: catName, content, createdAt: serverTimestamp() });
      if (++opCount >= 400) {
        await phraseBatch.commit();
        phraseBatch = writeBatch(db);
        opCount = 0;
      }
    }
  }
  if (opCount > 0) {
    await phraseBatch.commit();
  }

  alert('카테고리 & 숙어 일괄 등록 완료!');
};

const phraseDeleteAll = async () => {
  if (!window.confirm('정말 모든 카테고리와 숙어를 삭제하시겠습니까?')) return;
  // phrases 삭제
  let snap = await getDocs(collection(db, 'phrases'));
  let batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  // phraseCategories 삭제
  snap = await getDocs(collection(db, 'phraseCategories'));
  batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  alert('모든 카테고리 및 숙어 삭제 완료!');
};

const AdminTest = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1>Admin Test</h1>
      <div className="flex space-x-4 mt-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={wordsImportAll}>
          Words Import All
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={wordsDeleteAll}>
          Words Delete All
        </button>
      </div>
      <div className="flex space-x-4 mt-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={phraseImportAll}>
          Phrases Import All
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={phraseDeleteAll}>
          Phrases Delete All
        </button>
      </div>
    </div>
  );
};

export default AdminTest;
