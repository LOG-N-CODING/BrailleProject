// src/pages/Adimin/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Sidebar } from '../../components/Layout/Admin/Sidebar';
import { UserList } from '../../components/Layout/Admin/UserList';
import { QuizList } from '../../components/Layout/Admin/QuizList';
import { WordList } from '../../components/Layout/Admin/WordList';
import { PhraseList } from '../../components/Layout/Admin/PhraseList';
import AdminTest from '../../components/Layout/Admin/AdminTest';

export default function AdminPage() {
  const [searchParams] = useSearchParams();
  const defaultSection = (searchParams.get('section') as any) || 'Users';
  const [section, setSection] = useState<'Users' | 'Words' | 'Phrases' | 'Quizzes' | 'AdminTest'>(
    defaultSection
  );

  useEffect(() => {
    const sec = searchParams.get('section') as any;
    if (sec) setSection(sec);
  }, [searchParams]);

  return (
    <div className="flex">
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-gray-100 lg:shadow">
        <Sidebar onSelect={sec => setSection(sec)} />
      </div>
      {/* 4) 메인 컨텐츠 */}
      <main className="flex-1 bg-white min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-lg mx-auto pt-16">
          {section === 'Users' && <UserList />}
          {section === 'Words' && <WordList />}
          {section === 'Phrases' && <PhraseList />}
          {section === 'Quizzes' && <QuizList />}
          {section === 'AdminTest' && <AdminTest />}
        </div>
      </main>
    </div>
  );
}
