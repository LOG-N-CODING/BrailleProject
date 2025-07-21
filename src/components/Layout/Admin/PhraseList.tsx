// PhraseList.tsx

import React, { useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc as firestoreDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useCollection } from '../../../utils/useCollections';

type Category = { id: string; name: string };
type Phrase = { id: string; category: string; content: string; createdAt: number | Timestamp };

export function PhraseList() {
  const categories = useCollection<Category>('phraseCategories');
  const phrases = useCollection<Phrase>('phrases');

  const [newCat, setNewCat] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [newPhrase, setNewPhrase] = useState('');
  const [catError, setCatError] = useState('');
  const [phraseError, setPhraseError] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Helpers
  const phrasesInCat = phrases.filter(p => p.category === selectedCat);
  const countInCat = phrasesInCat.length;

  // Add category
  const handleAddCategory = async () => {
    setCatError('');
    const name = newCat.trim();
    if (!name) return;
    if (categories.length >= 5) {
      setCatError('You can create up to 5 categories.');
      return;
    }
    if (categories.some(c => c.name === name)) {
      setCatError('This category already exists.');
      return;
    }
    await addDoc(collection(db, 'phraseCategories'), {
      name,
      createdAt: serverTimestamp(),
    });
    setNewCat('');
  };

  // Delete category and its phrases
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`Delete category "${catName}" and all its phrases?`)) return;
    const batch = writeBatch(db);
    batch.delete(firestoreDoc(db, 'phraseCategories', catId));
    phrasesInCat.forEach(p => batch.delete(firestoreDoc(db, 'phrases', p.id)));
    await batch.commit();
    if (selectedCat === catName) setSelectedCat('');
  };

  // Add phrase
  const handleAddPhrase = async () => {
    setPhraseError('');
    const content = newPhrase.trim();
    if (!selectedCat) {
      setPhraseError('Please select a category first.');
      return;
    }
    if (!content) return;
    if (countInCat >= 10) {
      setPhraseError('Up to 10 phrases per category.');
      return;
    }
    if (phrasesInCat.some(p => p.content.toLowerCase() === content.toLowerCase())) {
      setPhraseError('This phrase already exists in this category.');
      return;
    }
    await addDoc(collection(db, 'phrases'), {
      category: selectedCat,
      content,
      createdAt: serverTimestamp(),
    });
    setNewPhrase('');
  };

  // Delete single phrase
  const handleDeletePhrase = async (id: string) => {
    if (!window.confirm('Delete this phrase?')) return;
    await deleteDoc(firestoreDoc(db, 'phrases', id));
  };

  // Start editing
  const startEdit = (p: Phrase) => {
    setEditingId(p.id);
    setEditingContent(p.content);
    setPhraseError('');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
    setPhraseError('');
  };
  const saveEdit = async (p: Phrase) => {
    const content = editingContent.trim();
    if (!content) {
      setPhraseError('Content cannot be empty.');
      return;
    }
    if (
      phrasesInCat
        .filter(x => x.id !== p.id)
        .some(x => x.content.toLowerCase() === content.toLowerCase())
    ) {
      setPhraseError('This phrase already exists in this category.');
      return;
    }
    await updateDoc(firestoreDoc(db, 'phrases', p.id), { content });
    cancelEdit();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Phrase Management</h2>

      {/* Category Management */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Categories ({categories.length}/5)</h3>
        <div className="flex space-x-2 mb-2">
          <input
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            placeholder="New category name"
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCat.trim() || categories.length >= 5}
            className={`px-4 py-2 rounded ${
              !newCat.trim() || categories.length >= 5
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Add
          </button>
        </div>
        {catError && <p className="text-red-600">{catError}</p>}

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center space-x-1">
              <button
                onClick={() => setSelectedCat(cat.name)}
                className={`px-3 py-1 rounded-full ${
                  selectedCat === cat.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {cat.name}
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                title="Delete category"
                className="text-red-600 hover:text-red-800"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Phrase Addition */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Add Phrase ({countInCat}/10)</h3>
        <div className="flex space-x-2">
          <input
            value={newPhrase}
            onChange={e => setNewPhrase(e.target.value)}
            placeholder="Enter new phrase"
            className="flex-1 border rounded p-2"
            disabled={!selectedCat}
          />
          <button
            onClick={handleAddPhrase}
            disabled={!selectedCat || !newPhrase.trim() || countInCat >= 10}
            className={`px-4 py-2 rounded ${
              !selectedCat || !newPhrase.trim() || countInCat >= 10
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Add
          </button>
        </div>
        {phraseError && <p className="text-red-600 mt-2">{phraseError}</p>}
        {!selectedCat && <p className="text-gray-500 mt-2">Please select a category.</p>}
      </section>

      {/* Phrase List */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Phrases</h3>
        {!selectedCat && <p className="text-gray-500">Select a category to view phrases.</p>}
        {selectedCat && (
          <>
            {phrasesInCat.length === 0 ? (
              <p className="text-gray-500">No phrases in this category.</p>
            ) : (
              <ul className="space-y-2">
                {phrasesInCat.map(p => (
                  <li key={p.id} className="flex justify-between items-center border-b py-2">
                    {editingId === p.id ? (
                      <div className="flex flex-1 space-x-2">
                        <input
                          className="flex-1 border rounded p-2"
                          value={editingContent}
                          onChange={e => setEditingContent(e.target.value)}
                        />
                        <button
                          onClick={() => saveEdit(p)}
                          className="px-3 py-1 bg-green-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button onClick={cancelEdit} className="px-3 py-1 bg-gray-300 rounded">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1">{p.content}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(p)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePhrase(p.id)}
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
            )}
          </>
        )}
      </section>
    </div>
  );
}
