import { useState } from 'react';
import { Sidebar } from '../../components/Layout/Admin/Sidebar';
import { UserList } from '../../components/Layout/Admin/UserList';
import { QuizList } from '../../components/Layout/Admin/QuizList';
import { WordList } from '../../components/Layout/Admin/WordList';
import { PhraseList } from '../../components/Layout/Admin/PhraseList';
import AdminTest from '../../components/Layout/Admin/AdminTest';

export default function AdminPage() {
  const [section, setSection] = useState<'Users' | 'Words' | 'Phrases' | 'Quizzes' | 'AdminTest'>(
    'Users'
  );

  return (
    <div className="flex">
      <Sidebar onSelect={setSection} />
      <main className="flex-1 p-6 bg-white">
        {section === 'Users' && <UserList />}
        {section === 'Words' && <WordList />}
        {section === 'Phrases' && <PhraseList />}
        {section === 'Quizzes' && <QuizList />}
        {section === 'AdminTest' && <AdminTest />}
      </main>
    </div>
  );
}
