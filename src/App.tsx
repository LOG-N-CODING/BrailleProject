import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import AlphabetLearning from './pages/Learn/AlphabetLearning';
import NumberLearning from './pages/Learn/NumberLearning';
import PracticeMode from './pages/Learn/PracticeMode';
import QuizMode from './pages/Quiz/QuizMode';
import FlashCards from './pages/Quiz/FlashCards';
import MemoryGame from './pages/Games/MemoryGame';
import WordGuessing from './pages/Games/WordGuessing';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Learn Routes */}
            <Route path="/learn/alphabet" element={<AlphabetLearning />} />
            <Route path="/learn/numbers" element={<NumberLearning />} />
            <Route path="/learn/practice" element={<PracticeMode />} />
            
            {/* Quiz Routes */}
            <Route path="/quiz" element={<QuizMode />} />
            <Route path="/quiz/flashcards" element={<FlashCards />} />
            
            {/* Game Routes */}
            <Route path="/games/memory" element={<MemoryGame />} />
            <Route path="/games/word-guessing" element={<WordGuessing />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Other Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
