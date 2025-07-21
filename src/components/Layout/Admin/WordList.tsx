// WordList.tsx

import React, { useState } from 'react';
import {
  addDoc,
  collection,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  doc as firestoreDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useCollection } from '../../../utils/useCollections';

type Word = {
  id: string;
  category: string;
  content: string;
  createdAt: number | Timestamp;
};

export function WordList() {
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const words = useCollection<Word>('words');

  // Group words by category
  const groupedWords = words.reduce((acc, w) => {
    if (!acc[w.category]) acc[w.category] = [];
    acc[w.category].push(w);
    return acc;
  }, {} as Record<string, Word[]>);

  const distinctCategoryCount = Object.keys(groupedWords).length;
  const isNewCategory = category && !groupedWords[category];
  const wordCountInCategory = groupedWords[category]?.length || 0;
  const isDuplicate = !!groupedWords[category]?.some(w => w.content === content);

  // Add new word
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !content) return;

    if (isDuplicate) {
      alert(`"${content}" already exists in "${category}" category.`);
      return;
    }
    if (isNewCategory && distinctCategoryCount >= 10) {
      alert('You can only create up to 10 categories.');
      return;
    }
    if (wordCountInCategory >= 20) {
      alert(`"${category}" category can only have up to 20 words.`);
      return;
    }

    const trimmed = content.trim();
    setCategory('');
    setContent('');
    await addDoc(collection(db, 'words'), {
      category,
      content: trimmed,
      createdAt: serverTimestamp(),
    });
  };

  // Delete a single word
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this word?')) return;
    await deleteDoc(firestoreDoc(db, 'words', id));
  };

  // Delete entire category
  const handleDeleteCategory = async (cat: string) => {
    const items = groupedWords[cat] || [];
    if (items.length === 0) return;
    if (window.confirm(`Are you sure you want to delete category "${cat}" and all its words?`)) {
      await Promise.all(items.map(w => deleteDoc(firestoreDoc(db, 'words', w.id))));
      if (selectedCategory === cat) {
        setSelectedCategory('');
      }
    }
  };

  // Edit word
  const startEdit = (w: Word) => {
    setEditingWordId(w.id);
    setEditingContent(w.content);
  };
  const cancelEdit = () => {
    setEditingWordId(null);
    setEditingContent('');
  };
  const saveEdit = async (w: Word) => {
    const trimmed = editingContent.trim();
    if (!trimmed) {
      alert('Content cannot be empty.');
      return;
    }
    // Prevent duplicates in same category
    if (groupedWords[w.category].filter(x => x.id !== w.id).some(x => x.content === trimmed)) {
      alert(`"${trimmed}" already exists in "${w.category}" category.`);
      return;
    }
    await updateDoc(firestoreDoc(db, 'words', w.id), { content: trimmed });
    cancelEdit();
  };

  // Words to display under selected category
  const displayedWords = selectedCategory ? groupedWords[selectedCategory] || [] : [];

  const canAdd =
    !!category &&
    !!content &&
    (!isNewCategory || distinctCategoryCount < 10) &&
    wordCountInCategory < 20 &&
    !isDuplicate;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Word Management</h2>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="e.g. noun, verb"
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Enter word"
            className="w-full border rounded p-2"
            required
          />
          {isDuplicate && (
            <p className="text-red-600 text-sm mt-1">
              "{content}" already exists in "{category}".
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!canAdd}
          className={`w-full py-2 text-white font-semibold rounded transition ${
            canAdd ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Add Word
        </button>
      </form>

      {/* Category Selector */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Select Category</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(groupedWords).map(cat => (
            <div key={cat} className="flex items-center space-x-1">
              <button
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
              <button
                onClick={() => handleDeleteCategory(cat)}
                title="Delete Category"
                className="text-red-600 hover:text-red-800"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Word List */}
      {selectedCategory && (
        <>
          <h4 className="text-lg font-medium mb-3">Words in "{selectedCategory}" category</h4>
          <ul className="space-y-3">
            {displayedWords.map(w => (
              <li key={w.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                {editingWordId === w.id ? (
                  <>
                    <input
                      type="text"
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      className="flex-1 border rounded p-2 mr-2"
                    />
                    <button
                      onClick={() => saveEdit(w)}
                      className="px-3 py-1 bg-blue-600 text-white rounded mr-2"
                    >
                      Save
                    </button>
                    <button onClick={cancelEdit} className="px-3 py-1 bg-gray-300 rounded">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{w.content}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(w)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
