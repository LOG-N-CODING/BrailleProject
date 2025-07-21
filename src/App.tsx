import { Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Layout/Footer';
import Header from './components/Layout/Header';
import { BrailleDeviceFloatingButton } from './components/UI';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import AdminPage from './pages/Adimin/AdminPage';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import app from './firebase/config';

// Firebase 초기화 후
// 1) Auth
export const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });

// 2) Firestore (optional, but 로컬 테스트용)
export const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

// 3) Functions
export const functions = getFunctions(app);
connectFunctionsEmulator(functions, '127.0.0.1', 5001);

function AppContent() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            {/* Learn */}
            <Route path="learn" element={<LearnIndex />} />
            <Route path="learn/alphabet-mode" element={<AlphabetModeSelect />} />
            <Route path="learn/alphabet" element={<AlphabetLearning />} />
            <Route path="learn/numbers" element={<NumberLearning />} />
            <Route path="learn/words" element={<WordLearning />} />
            <Route path="learn/phrases" element={<PhraseLearning />} />
            <Route path="learn/practice" element={<PracticeMode />} />

            {/* Quiz */}
            <Route path="quiz" element={<QuizIndex />} />
            <Route path="quiz/image-to-braille" element={<ImageToBraille />} />
            <Route path="quiz/math" element={<MathQuiz />} />

            {/* Games */}
            <Route path="games" element={<GameIndex />} />
            <Route path="games/typing-game" element={<TypingGame />} />
            <Route path="games/typing-sprint" element={<TypingSprint />} />

            {/* My Page */}
            <Route path="my" element={<MyPage />} />

            {/* Admin Page */}
            <Route
              path="admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </main>

      {/* 관리자일 때는 숨기고, 일반 유저일 때만 노출 */}
      {!isAdmin && <Footer />}
      {!isAdmin && <BrailleDeviceFloatingButton />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrailleDeviceProvider>
        <Router>
          <AppContent />
        </Router>
      </BrailleDeviceProvider>
    </AuthProvider>
  );
}

export default App;
