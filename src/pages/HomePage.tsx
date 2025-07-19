import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from '../components/UI/SectionHeader';

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
      <section className="relative flex items-center justify-center bg-white py-12 lg:py-40">
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
                <span className="text-[#2575FF]">Braille</span>
                <span className='text-black'>Play</span>
              </motion.h1>
              <motion.h2 
                className="text-xl sm:text-2xl lg:text-4xl font-light text-black mb-8"
                variants={fadeInUp}
              >
                Learn Braille Your Way — Lessons, Quizzes, and Games!
              </motion.h2>
              <motion.div variants={fadeInUp}>
                <Link
                  to="/learn"
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
                className="h-auto object-contain"
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
            <SectionHeader title="Feature Preview" />
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
              <Link to="/learn">
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
              </Link>
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
        className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.3 }}
        variants={fadeInUp}
      >
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-blue-300/20 rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 bg-purple-300/20 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
              Start Your Braille Journey Today!
            </h2>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of learners who have mastered Braille with our interactive platform. 
              Experience accessible learning designed for everyone.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: false }}
          >
            <Link
              to="/signup"
              className="group w-full sm:w-auto bg-white text-blue-600 px-8 sm:px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-center inline-flex items-center justify-center"
            >
              Get Started Free
              <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/learn/practice"
              className="group w-full sm:w-auto border-2 border-white text-white px-8 sm:px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 text-center inline-flex items-center justify-center"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Try Practice
            </Link>
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div 
            className="mt-12 sm:mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: false }}
          >
            <p className="text-blue-200 text-sm sm:text-base mb-6">Trusted by learners worldwide</p>
            <div className="flex justify-center items-center space-x-8 text-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1000+</div>
                <div className="text-sm">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
