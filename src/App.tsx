import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Layout/Footer';
import Header from './components/Layout/Header';
import { BrailleDeviceFloatingButton } from './components/UI';
import { BrailleDeviceProvider } from './contexts/BrailleDeviceContext';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import ContactPage from './pages/ContactPage';
import MemoryGame from './pages/Games/MemoryGame';
import WordGuessing from './pages/Games/WordGuessing';
import HomePage from './pages/HomePage';
import AlphabetLearning from './pages/Learn/AlphabetLearning';
import AlphabetModeSelect from './pages/Learn/AlphabetModeSelect';
import LearnIndex from './pages/Learn/LearnIndex';
import NumberLearning from './pages/Learn/NumberLearning';
import PhraseLearning from './pages/Learn/PhraseLearning';
import PracticeMode from './pages/Learn/PracticeMode';
import WordLearning from './pages/Learn/WordLearning';
import FlashCards from './pages/Quiz/FlashCards';
import QuizMode from './pages/Quiz/QuizMode';

function App() {
  return (
    <BrailleDeviceProvider>
      <Router>
        <div className="min-h-screen bg-white flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              
              {/* Learn Routes */}
              <Route path="/learn" element={<LearnIndex />} />
              <Route path="/learn/alphabet-mode" element={<AlphabetModeSelect />} />
              <Route path="/learn/alphabet" element={<AlphabetLearning />} />
              <Route path="/learn/words" element={<WordLearning />} />
              <Route path="/learn/phrases" element={<PhraseLearning />} />
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
          
          {/* Global Floating Button */}
          <BrailleDeviceFloatingButton />
        </div>
      </Router>
    </BrailleDeviceProvider>
  );
}

export default App;
