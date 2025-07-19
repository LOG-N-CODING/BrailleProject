import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Layout/Footer';
import Header from './components/Layout/Header';
import { BrailleDeviceFloatingButton } from './components/UI';
import { AuthProvider } from './contexts/AuthContext';
import { BrailleDeviceProvider } from './contexts/BrailleDeviceContext';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import MyPage from './pages/Auth/MyPage';
import ContactPage from './pages/ContactPage';
import GameIndex from './pages/Games/GameIndex';
import TypingGame from './pages/Games/TypingGame';
import TypingSprint from './pages/Games/TypingSprint';
import HomePage from './pages/HomePage';
import AlphabetLearning from './pages/Learn/AlphabetLearning';
import AlphabetModeSelect from './pages/Learn/AlphabetModeSelect';
import LearnIndex from './pages/Learn/LearnIndex';
import NumberLearning from './pages/Learn/NumberLearning';
import PhraseLearning from './pages/Learn/PhraseLearning';
import PracticeMode from './pages/Learn/PracticeMode';
import WordLearning from './pages/Learn/WordLearning';
import ImageToBraille from './pages/Quiz/ImageToBraille';
import MathQuiz from './pages/Quiz/MathQuiz';
import QuizIndex from './pages/Quiz/QuizIndex';

function App() {
  return (
    <AuthProvider>
      <BrailleDeviceProvider>
        <Router>
          <div className="min-h-screen bg-white flex flex-col ">
            <Header />
            <main className="flex-1 ">
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
                <Route path="/quiz" element={<QuizIndex />} />
                <Route path="/quiz/image-to-braille" element={<ImageToBraille />} />
                <Route path="/quiz/math" element={<MathQuiz />} />

                {/* Game Routes */}
                <Route path="/games" element={<GameIndex />} />
                <Route path="/games/typing-game" element={<TypingGame />} />
                <Route path="/games/typing-sprint" element={<TypingSprint />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* My Page */}
                <Route path="/my" element={<MyPage />} />

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
    </AuthProvider>
  );
}

export default App;
