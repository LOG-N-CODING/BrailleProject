import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from '../../components/UI/SectionHeader';
import SubSectionHeader from '../../components/UI/SubSectionHeader';

const LearnIndex: React.FC = () => {
  const learningModes = [
    {
      id: 'alphabet',
      title: 'Alphabet Learning',
      subtitle: 'Example words with pronunciation support',
      description: "Let's explore Braille letters together! Learn A–Z with example words and pronunciation support!",
      path: '/learn/alphabet-mode',
      image: '/images/figma/learn-alphabet.jpg',
      bgColor: 'from-blue-100 to-purple-100'
    },
    {
      id: 'numbers',
      title: 'Number Learning',
      subtitle: 'Visual and audio representation of number Braille',
      description: 'Explore Braille numbers from 0 to 9 using visual representations and clear audio pronunciation support!',
      path: '/learn/numbers',
      image: '/images/figma/learn-number.png',
      bgColor: 'from-green-100 to-blue-100'
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      subtitle: 'Instant feedback and corrections',
      description: 'In Practice Mode, you can enter Braille using a keyboard or tactile device and receive immediate feedback to help you learn and improve.',
      path: '/learn/practice',
      image: '/images/figma/learn-practice.jpg',
      bgColor: 'from-purple-100 to-pink-100'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
    <section className="relative overflow-hidden sm:min-h-screen min-h-[600px] max-h-[700px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/figma/Learn-hero-bg.png')" }}
        />
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-24 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-6/12 text-center lg:text-left mx-auto lg:mx-0"
          >
            <p className="text-base sm:text-lg text-white mb-4 max-w-2xl mx-auto lg:mx-0">
              Learn the Alphabet and Numbers with Braille
            </p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              style={{ fontFamily: 'Irish Grover' }}
            >
              Learn Braille
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white mb-8 max-w-2xl mx-auto font-light lg:mx-0">
              Ready to learn?<br />3 modes are waiting for you!
            </p>
            <Link
              to="/learn/alphabet"
              className="inline-flex items-center gap-3 bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-lg sm:text-xl lg:text-2xl font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Learn
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Learning Modes Section */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12 sm:mb-16"
          >
            <SectionHeader title="Learning Mode" />
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {learningModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Card Image */}
                <div className="aspect-[3/2] overflow-hidden bg-gray-900">
                    <Link
                        to={mode.path}
                    >
                      <img
                        src={mode.image}
                        alt={mode.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                </div>

                {/* Card Content */}
                <div className="flex flex-col p-4 sm:p-6" style={{ height: '280px' }}>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                        {mode.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 font-light">
                        {mode.subtitle}
                    </p>
                    <p className="text-sm text-gray-900 mb-6 font-light leading-relaxed">
                        {mode.description}
                    </p>
                    <div className="mt-auto">
                        <Link
                            to={mode.path}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md text-center font-medium hover:bg-blue-700 transition-colors duration-200 block"
                        >
                            Let's Learn
                        </Link>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Mode Sections */}
      <div className="space-y-0">
        {/* Alphabet Learning Detail */}
        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <SubSectionHeader subtitle="Example words with pronunciation support" />
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-4 sm:mb-6">
                  Alphabet Learning (A–Z)
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-900 font-light leading-relaxed mb-6 sm:mb-8">
                  Let's explore Braille letters together! Learn A–Z with example words and pronunciation support!
                </p>
                
                <Link
                    to="/learn/alphabet"
                    className="w-full sm:w-auto text-center inline-block bg-blue-600 text-white text-base sm:text-lg lg:text-xl py-3 sm:py-4 px-8 sm:px-12 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                    Alphabet Learning
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="order-1 lg:order-2 aspect-square bg-gray-900 rounded-lg overflow-hidden"
                style={{ maxWidth: 500 }}
              >
                <img
                  src="/images/figma/learn-alphabet.jpg"
                  alt="Alphabet Learning"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Number Learning Detail */}
        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="aspect-square bg-gray-900 rounded-lg overflow-hidden"
                style={{ maxWidth: 500 }}
              >
                <img
                  src="/images/figma/learn-number.png"
                  alt="Number Learning"
                  className="w-full h-full object-contain"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <SubSectionHeader subtitle="Visual and audio representation of number Braille" />
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-4 sm:mb-6">
                  Number Learning (0–9)
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-900 font-light leading-relaxed mb-6 sm:mb-8">
                  Explore Braille numbers from 0 to 9 using visual representations and clear audio pronunciation support!
                </p>
                
                <Link
                  to="/learn/numbers"
                  className="w-full sm:w-auto text-center inline-block bg-blue-600 text-white text-base sm:text-lg lg:text-xl py-3 sm:py-4 px-8 sm:px-12 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Number Learning
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Practice Mode Detail */}
        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <SubSectionHeader subtitle="Instant feedback and corrections" />
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-4 sm:mb-6">
                  Practice Mode
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-900 font-light leading-relaxed mb-6 sm:mb-8">
                  In Practice Mode, you can enter Braille using a keyboard or tactile device and receive immediate feedback to help you learn and improve.
                </p>
                
                <Link
                  to="/learn/practice"
                  className="w-full sm:w-auto text-center inline-block bg-blue-600 text-white text-base sm:text-lg lg:text-xl py-3 sm:py-4 px-8 sm:px-12 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Practice Mode
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="order-1 lg:order-2 aspect-square bg-gray-900 rounded-lg overflow-hidden"
                style={{ maxWidth: 500 }}
              >
                <img
                  src="/images/figma/learn-practice.jpg"
                  alt="Practice Mode"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LearnIndex;
