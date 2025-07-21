// QuizList.tsx

import React, { useState, useEffect, useRef } from 'react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc as firestoreDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { storage, db } from '../../../firebase/config';
import { useCollection } from '../../../utils/useCollections';

type Quiz = {
  id: string;
  type: 'image' | 'math';
  imageUrl?: string;
  word?: string;
  formula?: string;
  answer?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hint?: string;
  createdAt: any;
};

export function QuizList() {
  const [quizType, setQuizType] = useState<'image' | 'math'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [word, setWord] = useState('');
  const [formula, setFormula] = useState('');
  const [answer, setAnswer] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [hint, setHint] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const quizzes = useCollection<Quiz>('quizzes');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWord, setEditWord] = useState('');
  const [editHint, setEditHint] = useState('');
  const [editFormula, setEditFormula] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Preview selected image
  useEffect(() => {
    if (quizType === 'image' && file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview('');
  }, [quizType, file]);

  // Handle add new quiz
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quizType === 'image') {
      if (!file || !word) return;
      const ref = storageRef(storage, `quiz-images/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(ref, file);
      task.on(
        'state_changed',
        snap => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
        console.error,
        async () => {
          const imageUrl = await getDownloadURL(task.snapshot.ref);
          await addDoc(collection(db, 'quizzes'), {
            type: 'image',
            imageUrl,
            word,
            hint,
            createdAt: serverTimestamp(),
          });
          // reset form
          setFile(null);
          setWord('');
          setHint('');
          setUploadProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      );
    } else {
      if (!formula || !answer) return;
      await addDoc(collection(db, 'quizzes'), {
        type: 'math',
        formula,
        answer,
        hint,
        difficulty,
        createdAt: serverTimestamp(),
      });
      setFormula('');
      setAnswer('');
      setHint('');
      setDifficulty('easy');
    }
  };

  // Delete a quiz
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    await deleteDoc(firestoreDoc(db, 'quizzes', id));
  };

  // Start editing
  const startEdit = (q: Quiz) => {
    setEditingId(q.id);
    setEditHint(q.hint || '');
    if (q.type === 'image') {
      setEditWord(q.word || '');
    } else {
      setEditFormula(q.formula || '');
      setEditAnswer(q.answer || '');
      setEditDifficulty(q.difficulty || 'easy');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditWord('');
    setEditHint('');
    setEditFormula('');
    setEditAnswer('');
    setEditDifficulty('easy');
  };

  // Save edits
  const saveEdit = async (q: Quiz) => {
    const updates: Partial<Quiz> = { hint: editHint };
    if (q.type === 'image') {
      if (!editWord.trim()) {
        alert('Word cannot be empty.');
        return;
      }
      updates.word = editWord.trim();
    } else {
      if (!editFormula.trim() || !editAnswer.trim()) {
        alert('Formula and answer cannot be empty.');
        return;
      }
      updates.formula = editFormula.trim();
      updates.answer = editAnswer.trim();
      updates.difficulty = editDifficulty;
    }
    await updateDoc(firestoreDoc(db, 'quizzes', q.id), updates);
    cancelEdit();
  };

  // Filtered list by type
  const filteredQuizzes = quizzes.filter(q => q.type === quizType);

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Quiz Management</h2>

      {/* Add New Quiz */}
      <form onSubmit={handleSubmit} className="space-y-6 mb-10">
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={quizType === 'image'}
              onChange={() => setQuizType('image')}
            />
            <span>Image Quiz</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={quizType === 'math'}
              onChange={() => setQuizType('math')}
            />
            <span>Math Quiz</span>
          </label>
        </div>

        {quizType === 'image' ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Image File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="block w-full"
                  required
                />
              </div>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-blue-600" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
              <div>
                <label className="block mb-1">Answer (Word)</label>
                <input
                  type="text"
                  value={word}
                  onChange={e => {
                    setWord(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''));
                  }}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Hint</label>
                <input
                  type="text"
                  value={hint}
                  onChange={e => setHint(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Preview" className="w-64 h-64 object-cover rounded" />
              ) : (
                <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Preview</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Formula</label>
              <input
                type="text"
                value={formula}
                onChange={e => setFormula(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="e.g. 2+3*4"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Answer</label>
              <input
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Hint</label>
              <input
                type="text"
                value={hint}
                onChange={e => setHint(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full border rounded p-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Add Quiz
        </button>
      </form>

      {/* Existing Quizzes */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Manage Quizzes</h3>
        <ul className="space-y-4">
          {filteredQuizzes.map(q => (
            <li key={q.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded">
              {/* Display or Edit */}
              {editingId === q.id ? (
                <div className="flex-1 space-y-2">
                  {q.type === 'image' ? (
                    <div>
                      <label className="block mb-1">Word</label>
                      <input
                        type="text"
                        value={editWord}
                        onChange={e => setEditWord(e.target.value)}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block mb-1">Formula</label>
                        <input
                          type="text"
                          value={editFormula}
                          onChange={e => setEditFormula(e.target.value)}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Answer</label>
                        <input
                          type="text"
                          value={editAnswer}
                          onChange={e => setEditAnswer(e.target.value)}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Difficulty</label>
                        <select
                          value={editDifficulty}
                          onChange={e => setEditDifficulty(e.target.value as any)}
                          className="w-full border rounded p-2"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block mb-1">Hint</label>
                    <input
                      type="text"
                      value={editHint}
                      onChange={e => setEditHint(e.target.value)}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => saveEdit(q)}
                      className="px-4 py-1 bg-green-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button onClick={cancelEdit} className="px-4 py-1 bg-gray-300 rounded">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Display */}
                  {q.type === 'image' ? (
                    <img
                      src={q.imageUrl!}
                      alt={q.word}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded">
                      <span>
                        {q.formula} = {q.answer}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    {q.type === 'image' ? <div className="font-medium">{q.word}</div> : null}
                    {q.hint && <div className="text-sm text-gray-600">Hint: {q.hint}</div>}
                    {q.type === 'math' && q.difficulty && (
                      <div className="text-sm text-gray-600">Difficulty: {q.difficulty}</div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(q)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
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
      </div>
    </div>
  );
}
