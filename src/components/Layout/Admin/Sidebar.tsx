import { useState } from 'react';

const categories = ['Users', 'Words', 'Phrases', 'Quizzes', 'AdminTest'] as const;
type Cat = (typeof categories)[number];

export function Sidebar({ onSelect }: { onSelect: (c: Cat) => void }) {
  const [active, setActive] = useState<Cat>('Users');

  return (
    <div className="h-full bg-gray-100 p-4 overflow-y-auto">
      {categories.map(cat => (
        <div
          key={cat}
          className={`
            p-2 cursor-pointer rounded transition
            ${cat === active ? 'bg-white shadow' : 'hover:bg-gray-200'}
          `}
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
