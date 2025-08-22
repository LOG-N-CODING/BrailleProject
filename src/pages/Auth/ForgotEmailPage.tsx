// src/pages/Auth/ForgotEmailPage.tsx
import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const ForgotEmailPage: React.FC = () => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // YYYY-MM-DD
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const q = query(
        collection(db, 'users'),
        where('name', '==', name),
        where('dateOfBirth', '==', dateOfBirth)
      );
      const snaps = await getDocs(q);

      if (snaps.empty) {
        await Swal.fire({
          icon: 'error',
          title: 'Not Found',
          text: 'No user matches the provided name and date of birth.',
        });
      } else {
        const emails = snaps.docs.map(doc => doc.data().email).join(', ');
        await Swal.fire({
          icon: 'success',
          title: 'Email Found',
          html: `<p>${emails}</p>`,
        });
      }
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center">Find Your Email</h2>

        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="dob" className="block mb-1 font-medium">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={e => setDateOfBirth(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Find Email'}
        </button>

        <p className="text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotEmailPage;
