import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
// 더 느리고 부드러운 애니메이션 설정
  const fadeInUp = {
    initial: { opacity: 0, y: 120 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 1.5, 
      // ease: [0.16, 1, 0.3, 1], // 더 부드러운 easing
      // delay: 0.2 
    }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -120 },
    animate: { opacity: 1, x: 0 },
    transition: { 
      duration: 1.0, 
      // ease: [0.16, 1, 0.3, 1],
      // delay: 0.3
    }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 120 },
    animate: { opacity: 1, x: 0 },
    transition: { 
      duration: 1.0, 
      // ease: [0.16, 1, 0.3, 1],
      // delay: 0.4
    }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.3, // 자식 요소 간 간격 증가
        delayChildren: 0.2
      }
    }
  };

  // 호버 애니메이션도 더 부드럽게
  const smoothHover = {
    y: -8,
    transition: { 
      duration: 0.8, 
      // ease: [0.16, 1, 0.3, 1] 
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-white py-12 lg:py-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Content */}
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial="initial"
              whileInView="animate"
              viewport={{ once: false, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.p 
                className="text-lg sm:text-xl text-gray-700 mb-4"
                variants={fadeInUp}
              >
                Explore Braille through Learn, Quiz, and Game modes!
              </motion.p>
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-black mb-6" 
                style={{ fontFamily: 'Irish Grover' }}
                variants={fadeInUp}
              >
                BraillePlay
              </motion.h1>
              <motion.h2 
                className="text-xl sm:text-2xl lg:text-4xl font-light text-black mb-8"
                variants={fadeInUp}
              >
                Learn Braille Your Way — Lessons, Quizzes, and Games!
              </motion.h2>
              <motion.div variants={fadeInUp}>
                <Link
                  to="/learn/alphabet"
                  className="inline-flex items-center bg-white text-blue-600 border-2 border-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-light hover:bg-blue-50 transition-colors"
                >
                  Learn
                  <svg className="ml-2 h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Right Content - 3D Key Image */}
            <motion.div 
              className="flex-1 flex justify-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeInRight}
            >
              <img 
                src="/images/figma/hero-3d-key.png" 
                alt="3D Braille Key Device" 
                className="max-w-full h-auto object-contain w-full sm:w-4/5 lg:w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Preview Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="flex justify-center items-center mb-6 sm:mb-8">
              <div className="flex space-x-4 sm:space-x-8 items-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-light text-gray-600 lg:px-20">Feature Preview</h2>
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-8 lg:px-24"
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2 }}
            variants={staggerContainer}
          >
            {/* Learn Braille Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.6 } }}
            >
              <div className="h-40 sm:h-48">
                <img 
                  src="/images/figma/learn-braille-card.png" 
                  alt="Learn Braille" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-3 sm:mb-4 text-center">Learn Braille</h3>
                {/* <p className="text-sm text-gray-700 text-center leading-relaxed">
                  Let's explore Braille letters together! Learn A–Z with example words and pronunciation support!
                </p> */}
              </div>
            </motion.div>

            {/* Quiz Zone Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.6 } }}
            >
              <div className="h-40 sm:h-48">
                <img 
                  src="/images/figma/quiz-zone-card.png" 
                  alt="Quiz Zone" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-3 sm:mb-4 text-center">Quiz Zone</h3>
              </div>
            </motion.div>

            {/* Games Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1"
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.6 } }}
            >
              <div className="h-40 sm:h-48">
                <img 
                  src="/images/figma/games-card.png" 
                  alt="Games" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-3 sm:mb-4 text-center">Games</h3>
                {/* <p className="text-sm text-gray-700 text-center leading-relaxed">
                  In Practice Mode, you can enter Braille using a keyboard or tactile device and receive immediate feedback to help you learn and improve.
                </p> */}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Braille Learning Matters Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial="initial"
              whileInView="animate"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeInLeft}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6">Why Braille Learning Matters</h2>
              <p className="text-lg sm:text-xl lg:text-2xl font-light text-black mb-6 sm:mb-8">
                "Learn to read the world with your fingertips."
              </p>
              <div className="text-base sm:text-lg text-black leading-relaxed space-y-3 sm:space-y-4">
                <p>Explains the information access gap for people with visual impairments</p>
                <p>Connects Braille literacy to independence and empowerment</p>
                <p>Includes a short story or testimonial from a real user</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex-1"
              initial="initial"
              whileInView="animate"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeInRight}
            >
              <img 
                src="/images/figma/braille-why-matters-image.png" 
                alt="Why Braille Learning Matters" 
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to Use the App Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <motion.div 
              className="flex-1 order-2 lg:order-1"
              initial="initial"
              whileInView="animate"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeInLeft}
            >
              <img 
                src="/images/figma/how-to-use-app-image.png" 
                alt="How to Use the App" 
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </motion.div>
            <motion.div 
              className="flex-1 text-center lg:text-left order-1 lg:order-2"
              initial="initial"
              whileInView="animate"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeInRight}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6">How to Use the App</h2>
              <p className="text-lg sm:text-xl lg:text-2xl font-light text-black mb-6 sm:mb-8">
                "Learn Braille easily with our app — just follow the steps!"
              </p>
              <div className="text-base sm:text-lg text-black leading-relaxed space-y-3 sm:space-y-4">
                <p>Start learning — choose letters, numbers</p>
                <p>Play games and take quizzes to test your skills.</p>
                <p>Earn cool badges and see how far you've come!</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Accessibility Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial="initial"
              whileInView="animate"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeInLeft}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6">Accessibility Features</h2>
              <p className="text-lg sm:text-xl lg:text-2xl font-light text-black mb-6 sm:mb-8">
                "Designed for Everyone"
              </p>
              <div className="text-base sm:text-lg text-black leading-relaxed space-y-3 sm:space-y-4">
                <p><strong>Screen Reader Support:</strong> Automatically reads text aloud</p>
                <p><strong>Audio Guide:</strong> Voice instructions for learning content</p>
                <p><strong>High Contrast & Large Text:</strong> Visual enhancements for low vision users</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex-1"
              initial="initial"
              whileInView="animate"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeInRight}
            >
              <img 
                src="/images/figma/accessibility-features-image.png" 
                alt="Accessibility Features" 
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800"
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">Start Your Braille Journey Today!</h2>
          <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8">
            Join thousands of learners who have mastered Braille with our interactive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/auth/signup"
              className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
            >
              Get Started Free
            </Link>
            <Link
              to="/learn/alphabet"
              className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
