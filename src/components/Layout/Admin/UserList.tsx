// UserList.tsx

import { useCollection } from '../../../utils/useCollections';

type User = { id: string; email: string; createdAt: number };

export function UserList() {
  const users = useCollection<User>('users');

  return (
    <div>
      <h2 className="text-xl mb-4">User 목록</h2>
      <ul>
        {users.map(u => (
          <li key={u.id} className="p-2 border-b">
            {u.email} — 가입일: {new Date(u.createdAt).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
