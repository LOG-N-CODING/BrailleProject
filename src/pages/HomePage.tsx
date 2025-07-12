import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800"
        style={{
          backgroundImage: `url('data:image/svg+xml;base64,${btoa(`
            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fill-rule="evenodd">
                <g fill="#ffffff" fill-opacity="0.1">
                  <circle cx="20" cy="20" r="2"/>
                  <circle cx="40" cy="20" r="2"/>
                  <circle cx="20" cy="40" r="2"/>
                  <circle cx="40" cy="40" r="2"/>
                </g>
              </g>
            </svg>
          `)}')`
        }}
      >
        <div className="text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-7xl font-bold font-irish mb-6">Learn Braille</h1>
          <p className="text-xl mb-4">Learn the Alphabet and Numbers with Braille</p>
          <p className="text-4xl mb-8">Ready to learn? 3 modes are waiting for you!</p>
          <Link
            to="/learn/alphabet"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-xl text-xl font-semibold hover:bg-gray-100 transition-colors border border-white"
          >
            Learn
            <svg className="ml-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Learning Modes Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center mb-8">
              <div className="flex space-x-8">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
                <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
                <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
                <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
              </div>
            </div>
            <h2 className="text-4xl font-light text-gray-600 mb-4">Learning Mode</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Alphabet Learning Card */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Alphabet Learning</h3>
                <p className="text-sm text-gray-600 mb-4">Example words with pronunciation support</p>
                <p className="text-sm text-gray-700 mb-6">
                  Let's explore Braille letters together! Learn A–Z with example words and pronunciation support!
                </p>
                <Link
                  to="/learn/alphabet"
                  className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors text-center block"
                >
                  Let's Learn
                </Link>
              </div>
            </div>

            {/* Number Learning Card */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Number Learning</h3>
                <p className="text-sm text-gray-600 mb-4">Visual and audio representation of number Braille</p>
                <p className="text-sm text-gray-700 mb-6">
                  Explore Braille numbers from 0 to 9 using visual representations and clear audio pronunciation support!
                </p>
                <Link
                  to="/learn/numbers"
                  className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors text-center block"
                >
                  Let's Learn
                </Link>
              </div>
            </div>

            {/* Practice Mode Card */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Practice Mode</h3>
                <p className="text-sm text-gray-600 mb-4">Interactive practice with Braille input device</p>
                <p className="text-sm text-gray-700 mb-6">
                  Practice your Braille skills with our interactive input device! Real-time feedback helps you improve.
                </p>
                <Link
                  to="/learn/practice"
                  className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors text-center block"
                >
                  Let's Practice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-16">Why Choose BraillePlay?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Interactive Learning</h3>
              <p className="text-gray-600">
                Learn Braille through interactive exercises with real-time feedback and visual aids.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Audio Support</h3>
              <p className="text-gray-600">
                Enhanced learning with pronunciation support and audio feedback for better understanding.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hardware Integration</h3>
              <p className="text-gray-600">
                Connect with Arduino-based Braille input device for authentic tactile learning experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Start Your Braille Journey Today!</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners who have mastered Braille with our interactive platform.
          </p>
          <div className="space-x-4">
            <Link
              to="/auth/signup"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Get Started Free
            </Link>
            <Link
              to="/learn/alphabet"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-block"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
