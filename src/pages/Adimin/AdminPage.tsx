// src/pages/Adimin/AdminPage.tsx
import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* 1) 모바일: 햄버거 아이콘 */}
      <div className="lg:hidden p-4">
        <button onClick={() => setSidebarOpen(true)}>
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      {/* 2) 사이드바(드로어 + 고정) */}
      <div
        className={`
          fixed inset-y-0 left-0 w-64 bg-gray-100 z-40
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
        `}
      >
        {/* 모바일에서 닫기 버튼 */}
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <Sidebar
          onSelect={sec => {
            setSection(sec);
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* 3) 드로어 백드롭 (모바일 전용) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 4) 메인 컨텐츠 */}
      <main className="flex-1 bg-white min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-lg mx-auto">
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
