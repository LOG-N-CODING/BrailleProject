import { useState } from 'react';

const categories = ['Users', 'Words', 'Phrases', 'Quizzes', 'AdminTest'] as const;
type Cat = (typeof categories)[number];

export function Sidebar({ onSelect }: { onSelect: (c: Cat) => void }) {
  const [active, setActive] = useState<Cat>('Users');

  return (
    <div className="w-48 h-screen bg-gray-100 p-4">
      {categories.map(cat => (
        <div
          key={cat}
          className={`p-2 cursor-pointer rounded ${cat === active ? 'bg-white shadow' : ''}`}
          onClick={() => {
            setActive(cat);
            onSelect(cat);
          }}
        >
          {cat}
        </div>
      ))}
    </div>
  );
}
