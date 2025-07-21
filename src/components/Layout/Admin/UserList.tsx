// UserList.tsx
import React from 'react';
import { Timestamp } from 'firebase/firestore';
import { useCollection } from '../../../utils/useCollections';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../contexts/AuthContext';

type User = { id: string; email: string; createdAt: number };

export function UserList() {
  const users = useCollection<User>('users');
  const { user } = useAuth();
  const functions = getFunctions();

  // Exclude the current admin from the list
  const filteredUsers = users.filter(u => u.id !== user?.uid);

  // Convert Firestore Timestamp or millisecond number to JS Date
  const toDate = (ts: number | Timestamp): Date =>
    ts instanceof Timestamp ? ts.toDate() : new Date(ts);

  const handleDelete = async (uid: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const fn = httpsCallable<{ uid: string }, { success: boolean }>(
        functions,
        'deleteUserAndData'
      );
      const res = await fn({ uid });
      if (res.data.success) {
        alert('User has been deleted.');
      }
    } catch (err: any) {
      console.error('Delete failed', err);
      alert('Error deleting user: ' + (err.message || err.code));
    }
  };

  return (
    <div>
      <h2 className="text-xl mb-4">User List</h2>
      <ul>
        {filteredUsers.map(u => (
          <li key={u.id} className="flex justify-between items-center p-2 border-b">
            <span>
              {u.email} — Registration Date: {toDate(u.createdAt).toLocaleDateString()}
            </span>
            <button
              onClick={() => handleDelete(u.id)}
              className="ml-4 text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
