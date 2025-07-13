import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    dateOfBirth: '',
    email: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));
    setError('');

    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const getPasswordStrengthScore = () => {
    const scores = Object.values(passwordStrength);
    return scores.filter(Boolean).length;
  };

  const getPasswordStrengthColor = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const validateForm = () => {
    if (!formData.username || !formData.name) {
      setError('Please enter your username and name.');
      return false;
    }
    
    if (!formData.email) {
      setError('Please enter your email address.');
      return false;
    }
    
    if (getPasswordStrengthScore() < 3) {
      setError('Please choose a stronger password.');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement Firebase Auth signup
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      console.log('Signup successful:', formData.email);
      // Redirect to welcome page or dashboard
      
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-0 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center w-full gap-6 sm:gap-8 lg:gap-12">
          <div className="flex space-x-3 sm:space-x-4 lg:space-x-8 items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-gray-600 px-4 sm:px-8 lg:px-12 xl:px-20">Sign Up</h2>
            <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
          </div>
        
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl lg:shadow-2xl p-6 sm:p-8 lg:p-10 xl:p-12">
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <div className="flex">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="username"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="password"
                />
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div 
                          className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(getPasswordStrengthScore() / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {getPasswordStrengthScore() <= 2 ? 'Weak' : 
                          getPasswordStrengthScore() <= 3 ? 'Fair' :
                          getPasswordStrengthScore() <= 4 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-2 text-xs">
                      <div className={`flex items-center ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-1">{passwordStrength.length ? '✓' : '○'}</span>
                        8+ characters
                      </div>
                      <div className={`flex items-center ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-1">{passwordStrength.uppercase ? '✓' : '○'}</span>
                        Uppercase
                      </div>
                      <div className={`flex items-center ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-1">{passwordStrength.lowercase ? '✓' : '○'}</span>
                        Lowercase
                      </div>
                      <div className={`flex items-center ${passwordStrength.number ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="mr-1">{passwordStrength.number ? '✓' : '○'}</span>
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Confirm Password"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Name"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 border rounded transition-colors text-sm sm:text-base pr-10"
                    placeholder="Date of Birth"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="john.doe@example.com"
                />
              </div>

              {/* Terms Agreement */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading || !formData.agreeToTerms}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-light hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg lg:text-xl"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Back Button */}
            <div className="mt-4 sm:mt-6">
              <Link
                to="/login"
                className="w-full bg-white text-blue-600 py-2 sm:py-3 rounded-lg font-light border border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center text-base sm:text-lg lg:text-xl"
              >
                Back
              </Link>
            </div>

            {/* Login Link */}
            <div className="text-center mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;