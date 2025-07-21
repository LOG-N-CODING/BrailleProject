import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, user } = useAuth(); // user 추가

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ① UserCredential을 직접 받는다
      const credential = await signIn(formData.email, formData.password);
      const uid = credential.uid;

      // ② Firestore에서 권한 확인
      const snap = await getDoc(doc(db, 'users', uid));
      const data = snap.data();

      if (data?.isAdmin === 1) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col mx-auto max-w-md p-8 rounded shadow">
      <h2 className="text-2xl font-light text-center mb-6">Login</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 text-white rounded ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } transition`}
        >
          {isLoading ? 'Signing In…' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
