import React, { useState, useEffect } from 'react';
import { BRAILLE_ALPHABET, BRAILLE_NUMBERS, generateBraillePattern, parseInputBits, findCharacterFromDots, getDotsFromCharacter } from '../../utils/braille';
import { SectionHeader } from '../../components/UI';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';
import { useNavigate } from 'react-router-dom';

const PracticeMode: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, setOnDataCallback } = useBrailleDevice();
  
  // 현재 입력된 점자 패턴
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [currentBraillePattern, setCurrentBraillePattern] = useState<string>('⠀');
  const [lastInputTime, setLastInputTime] = useState<Date | null>(null);
  
  // 일치하는 문자/숫자
  const [matchingAlphabet, setMatchingAlphabet] = useState<string>('');
  const [matchingNumber, setMatchingNumber] = useState<string>('');
  const [showBrailleKeyboard, setShowBrailleKeyboard] = useState(true);

  // 시리얼 디바이스 데이터 수신 처리
  useEffect(() => {
    if (isConnected) {
      const handleData = (data: number) => {
        const bits = parseInputBits(data);
        
        if (bits.includes(-1)) {
          // 백스페이스 - 입력 초기화
          handleClear();
        } else if (bits.length > 0 && !bits.includes(-1) && !bits.includes(-2)) {
          setActiveDots(bits);
          updateBrailleDisplay(bits);
          setLastInputTime(new Date());
        }
      };

      setOnDataCallback(handleData);
    }
  }, [isConnected]);

  const handleClear = () => {
    setActiveDots([]);
    setCurrentBraillePattern('⠀');
    setMatchingAlphabet('');
    setMatchingNumber('');
    setLastInputTime(null);
  };

  const updateBrailleDisplay = (dots: number[]) => {
    if (dots.length === 0) {
      setCurrentBraillePattern('⠀');
      setMatchingAlphabet('');
      setMatchingNumber('');
      return;
    }

    // 점자 패턴 생성
    const pattern = generateBraillePattern(dots);
    setCurrentBraillePattern(pattern);

    // 알파벳 매칭
    const alphabetMatch = Object.keys(BRAILLE_ALPHABET).find(
      letter => JSON.stringify(BRAILLE_ALPHABET[letter]) === JSON.stringify(dots)
    );
    setMatchingAlphabet(alphabetMatch || '');

    // 숫자 매칭
    const numberMatch = Object.keys(BRAILLE_NUMBERS).find(
      number => JSON.stringify(BRAILLE_NUMBERS[number]) === JSON.stringify(dots)
    );
    setMatchingNumber(numberMatch || '');

    // TTS 음성 출력 (알파벳이나 숫자가 매칭되었을 때)
    if (alphabetMatch || numberMatch) {
      const textToSpeak = alphabetMatch || getNumberWord(numberMatch || '');
      playTTS(textToSpeak);
    }
  };

  // 숫자를 영어 단어로 변환
  const getNumberWord = (number: string): string => {
    const numberWords: { [key: string]: string } = {
      '0': 'zero',
      '1': 'one',
      '2': 'two', 
      '3': 'three',
      '4': 'four',
      '5': 'five',
      '6': 'six',
      '7': 'seven',
      '8': 'eight',
      '9': 'nine'
    };
    return numberWords[number] || number;
  };

  // TTS 음성 재생 함수
  const playTTS = (text: string) => {
    try {
      // speechSynthesis가 사용 가능한지 확인
      if ('speechSynthesis' in window) {
        // 기존 음성 중단
        speechSynthesis.cancel();
        
        // 약간의 딜레이 후 실행 (브라우저 정책 대응)
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.8;
          utterance.pitch = 1;
          utterance.volume = 1.0; // 볼륨 최대
          utterance.lang = 'en-US';
          
          // 이벤트 리스너 추가 (디버깅용)
          utterance.onstart = () => {
            console.log(`🔊 TTS started: ${text}`);
          };
          utterance.onend = () => {
            console.log(`✅ TTS finished: ${text}`);
          };
          utterance.onerror = (event) => {
            console.error('❌ TTS error:', event);
          };
          
          console.log(`🎵 Speaking in Practice Mode: "${text}"`);
          speechSynthesis.speak(utterance);
        }, 100);
      } else {
        console.error('❌ speechSynthesis not supported in this browser');
      }
    } catch (error) {
      console.error('❌ TTS error:', error);
    }
  };

  const handleBrailleKeyClick = (dot: number) => {
    const newActiveDots = activeDots.includes(dot) 
      ? activeDots.filter(d => d !== dot) 
      : [...activeDots, dot].sort((a, b) => a - b);
    
    setActiveDots(newActiveDots);
    updateBrailleDisplay(newActiveDots);
    setLastInputTime(new Date());
  };

  const getDotPatternText = () => {
    if (activeDots.length === 0) return '';
    return activeDots.join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Title Section */}
        <div className="text-center mb-16">
          <SectionHeader title="Practice Mode" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice braille typing and see the letter and number you type instantly!
          </p>
        </div>

        {/* Main Practice Area */}
        <div className="flex justify-center items-center gap-12 mb-16">
          {/* Alphabet Card */}
          <div className="bg-white rounded-3xl shadow-lg border-[3px] border-blue-500 p-8 w-80 h-96 flex flex-col justify-center items-center">
            <div className="text-8xl font-bold text-blue-600 mb-4">
              {currentBraillePattern}
            </div>
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {matchingAlphabet || '?'}
            </div>
            <div className="text-3xl text-gray-600 mb-4">
              {getDotPatternText()}
            </div>
            {/* TTS 버튼 - 알파벳 */}
            {matchingAlphabet && (
              <button
                onClick={() => playTTS(matchingAlphabet)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                🔊 Play "{matchingAlphabet}"
              </button>
            )}
          </div>

          {/* Number Card */}
          <div className="bg-white rounded-3xl shadow-lg border-[3px] border-blue-500 p-8 w-80 h-96 flex flex-col justify-center items-center">
            <div className="text-8xl font-bold text-blue-600 mb-4">
              {currentBraillePattern}
            </div>
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {matchingNumber || '?'}
            </div>
            <div className="text-3xl text-gray-600 mb-4">
              {getDotPatternText()}
            </div>
            {/* TTS 버튼 - 숫자 */}
            {matchingNumber && (
              <button
                onClick={() => playTTS(getNumberWord(matchingNumber))}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                🔊 Play "{getNumberWord(matchingNumber)}"
              </button>
            )}
          </div>

          {/* Braille Keyboard - Conditional Display */}
          {showBrailleKeyboard && (
            <div className="bg-gradient-to-b from-blue-500 to-blue-700 rounded-3xl p-5 w-48 h-96">
              <div className="grid grid-cols-2 gap-2 h-full place-items-center">
                {/* Row 1 */}
                <button
                  onClick={() => handleBrailleKeyClick(1)}
                  className={`w-16 h-16 rounded-xl border-[3px] transition-all ${
                    activeDots.includes(1) 
                      ? 'bg-green-200 border-green-400' 
                      : 'bg-white border-green-400 hover:bg-green-50'
                  }`}
                />
                <button
                  onClick={() => handleBrailleKeyClick(4)}
                  className={`w-16 h-16 rounded-xl border-[3px] transition-all ${
                    activeDots.includes(4) 
                      ? 'bg-green-200 border-green-400' 
                      : 'bg-white border-green-400 hover:bg-green-50'
                  }`}
                />

                {/* Row 2 */}
                <button
                  onClick={() => handleBrailleKeyClick(2)}
                  className={`w-16 h-16 rounded-xl border-[3px] transition-all ${
                    activeDots.includes(2) 
                      ? 'bg-green-200 border-green-400' 
                      : 'bg-white border-green-400 hover:bg-green-50'
                  }`}
                />
                <button
                  onClick={() => handleBrailleKeyClick(5)}
                  className={`w-16 h-16 rounded-xl border-[3px] transition-all ${
                    activeDots.includes(5) 
                      ? 'bg-green-200 border-green-400' 
                      : 'bg-white border-green-400 hover:bg-green-50'
                  }`}
                />

                {/* Row 3 */}
                <button
                  onClick={() => handleBrailleKeyClick(3)}
                  className={`w-16 h-16 rounded-xl border-[3px] transition-all ${
                    activeDots.includes(3) 
                      ? 'bg-green-200 border-green-400' 
                      : 'bg-white border-green-400 hover:bg-green-50'
                  }`}
                />
                <button
                  onClick={() => handleBrailleKeyClick(6)}
                  className={`w-16 h-16 rounded-xl border-[3px] transition-all ${
                    activeDots.includes(6) 
                      ? 'bg-green-200 border-green-400' 
                      : 'bg-white border-green-400 hover:bg-green-50'
                  }`}
                />

                {/* Control buttons */}
                <button
                  onClick={handleClear}
                  className="w-16 h-16 bg-white rounded-xl border-[3px] border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center text-center"
                  title="Backspace / Clear"
                >
                  <span className="material-icons">backspace</span>
                </button>
                <button
                  className="w-16 h-16 bg-white rounded-xl border-[3px] border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center text-center"
                  title="Enter"
                >
                  <span className="material-icons">keyboard_return</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Braille Keyboard Toggle Button */}
        <button
          onClick={() => setShowBrailleKeyboard(!showBrailleKeyboard)}
          className={`fixed left-4 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 z-50 ${
            showBrailleKeyboard 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-bold text-xs flex flex-col items-center justify-center`}
        >
          <div className="text-lg">⠿</div>
          <div>{showBrailleKeyboard ? 'Hide' : 'Show'}</div>
        </button>

        {/* Large Braille Display */}
        <div className="flex justify-center space-x-8 mb-16">
          <div className="bg-gray-100 rounded-full p-8 w-96 h-32 flex items-center justify-center">
            <span className="text-8xl font-mono text-blue-600">
              {currentBraillePattern}
            </span>
          </div>
          
          <div className="bg-gray-100 rounded-full p-8 w-96 h-32 flex items-center justify-center">
            <span className="text-8xl font-bold text-blue-600">
              {matchingAlphabet || matchingNumber || '?'}
            </span>
          </div>
          
          <div className="bg-gray-100 rounded-full p-8 w-96 h-32 flex items-center justify-center">
            <span className="text-8xl font-bold text-blue-600">
              {matchingNumber || '?'}
            </span>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/learn')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Learning Menu
          </button>
        </div>
      </div>

    </div>
  );
};

export default PracticeMode;
