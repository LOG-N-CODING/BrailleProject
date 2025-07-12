import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'technology' | 'accessibility'>('about');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-600 mb-4">About Braille Learning</h1>
          <p className="text-lg text-gray-600">Learn about our mission and technology</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'about', label: 'About Us', icon: '📖' },
                { id: 'technology', label: 'Technology', icon: '🔧' },
                { id: 'accessibility', label: 'Accessibility', icon: '♿' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'about' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    We believe that learning Braille should be accessible, interactive, and engaging for everyone. 
                    Our platform combines modern web technology with tactile learning methods to create an 
                    innovative educational experience.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Whether you're a student learning Braille for the first time, an educator looking for 
                    teaching resources, or someone who wants to better understand this important communication 
                    system, our platform provides the tools and knowledge you need.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Learning</h3>
                    <p className="text-gray-600">
                      Hands-on exercises and games that make learning Braille fun and engaging.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔗</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Hardware Integration</h3>
                    <p className="text-gray-600">
                      Connect with Arduino-based tactile devices for authentic Braille input experience.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Progress Tracking</h3>
                    <p className="text-gray-600">
                      Monitor your learning journey with detailed progress tracking and achievements.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'technology' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Technology Stack</h2>
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Our platform is built using modern web technologies and integrates with hardware 
                    devices to provide a comprehensive learning experience.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Frontend Technologies</h3>
                    <ul className="space-y-2 text-blue-700">
                      <li>• React 18 with TypeScript</li>
                      <li>• Tailwind CSS for responsive design</li>
                      <li>• React Router for navigation</li>
                      <li>• Web Serial API for hardware integration</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-green-800 mb-4">Backend Services</h3>
                    <ul className="space-y-2 text-green-700">
                      <li>• Firebase Authentication</li>
                      <li>• Firestore Database</li>
                      <li>• Firebase Cloud Functions</li>
                      <li>• Firebase Hosting</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-purple-800 mb-4">Hardware Integration</h3>
                    <ul className="space-y-2 text-purple-700">
                      <li>• Arduino-based Braille input device</li>
                      <li>• 8-bit serial communication</li>
                      <li>• Real-time tactile feedback</li>
                      <li>• Web Serial API compatibility</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-yellow-800 mb-4">External APIs</h3>
                    <ul className="space-y-2 text-yellow-700">
                      <li>• Free Dictionary API</li>
                      <li>• Text-to-Speech synthesis</li>
                      <li>• Audio pronunciation support</li>
                      <li>• Definition and phonetic data</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Braille System Implementation</h3>
                  <p className="text-gray-700 mb-4">
                    Our system implements the standard 6-dot Braille system for English alphabet (A-Z) and numbers (0-9):
                  </p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Grade 1 Braille character mapping</li>
                    <li>• 8-bit input parsing for hardware devices</li>
                    <li>• Unicode Braille pattern generation</li>
                    <li>• Real-time character recognition</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Accessibility Features</h2>
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Accessibility is at the core of our design. We've implemented comprehensive features 
                    to ensure our platform is usable by everyone, regardless of their abilities.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-blue-800 mb-4">🔊 Audio Support</h3>
                      <ul className="space-y-2 text-blue-700">
                        <li>• Screen reader compatibility</li>
                        <li>• Text-to-speech for all content</li>
                        <li>• Audio pronunciation guides</li>
                        <li>• Sound feedback for interactions</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-green-800 mb-4">⌨️ Keyboard Navigation</h3>
                      <ul className="space-y-2 text-green-700">
                        <li>• Full keyboard navigation support</li>
                        <li>• Intuitive tab order</li>
                        <li>• Keyboard shortcuts for efficiency</li>
                        <li>• Focus indicators for all elements</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-purple-800 mb-4">👁️ Visual Design</h3>
                      <ul className="space-y-2 text-purple-700">
                        <li>• High contrast color schemes</li>
                        <li>• Scalable font sizes</li>
                        <li>• Clear visual hierarchy</li>
                        <li>• Consistent design patterns</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-yellow-800 mb-4">🤝 Universal Design</h3>
                      <ul className="space-y-2 text-yellow-700">
                        <li>• WCAG 2.1 AA compliance</li>
                        <li>• Semantic HTML structure</li>
                        <li>• ARIA labels and descriptions</li>
                        <li>• Mobile-responsive design</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-4">🔧 Hardware Accessibility</h3>
                  <p className="text-indigo-700 mb-4">
                    Our Arduino-based input device is designed with accessibility in mind:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-indigo-700">
                    <li>• Tactile button layout matching Braille cell</li>
                    <li>• Adjustable sensitivity settings</li>
                    <li>• Ergonomic design for comfortable use</li>
                    <li>• Visual and audio confirmation feedback</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary-500 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-6">
            Join thousands of learners who are mastering Braille with our interactive platform.
          </p>
          <div className="space-x-4">
            <Link
              to="/learn"
              className="bg-white text-primary-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Start Learning
            </Link>
            <Link
              to="/contact"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-block border border-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
