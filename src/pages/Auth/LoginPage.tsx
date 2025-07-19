import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { email, password } = formData;
    try {
      await signIn(email, password);
      setError(null);
      navigate('/');
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-0 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center w-full gap-6 sm:gap-8 lg:gap-12">
          {/* Decorative elements */}
          <div className="flex justify-center items-center mb-4 sm:mb-6 lg:mb-8">
            <div className="flex space-x-3 sm:space-x-4 lg:space-x-8 items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
              <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-gray-600 px-4 sm:px-8 lg:px-12 xl:px-20">
                Login
              </h2>
              <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
              <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
            </div>
          </div>

          {/* Login Form */}
          <div className="w-full max-w-sm sm:max-w-sm md:max-w-md lg:max-w-lg">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-8 lg:p-10">
              {/* Logo */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <img
                  src="/images/figma/logo.png"
                  alt="Logo"
                  className="w-32 h-28 sm:w-36 sm:h-32 md:w-40 md:h-36 lg:w-44 lg:h-40 object-contain"
                />
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <div className="flex">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-gray-800 mb-1 sm:mb-2"
                  >
                    email
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-medium text-gray-800 mb-1 sm:mb-2"
                  >
                    password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg text-lg sm:text-xl font-light hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm sm:text-base">Signing In...</span>
                    </>
                  ) : (
                    'Login'
                  )}
                </button>

                <Link
                  to="/signup"
                  className="w-full inline-block text-center border border-blue-600 text-blue-600 py-2 sm:py-3 rounded-lg text-lg sm:text-xl font-light hover:bg-blue-50 transition-colors"
                >
                  Sign up
                </Link>

                <div className="text-center space-y-1 sm:space-y-2">
                  <Link
                    to="/forgot-email"
                    className="block text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors"
                  >
                    Find your <span className="font-bold">email</span>
                  </Link>
                  <Link
                    to="/forgot-password"
                    className="block text-gray-600 text-xs sm:text-sm hover:text-blue-600 transition-colors"
                  >
                    Forgot your <span className="font-bold">password?</span>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
