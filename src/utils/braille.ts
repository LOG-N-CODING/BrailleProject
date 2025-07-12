// 점자 문자 매핑 (영문 A-Z)
export const BRAILLE_ALPHABET: Record<string, number[]> = {
  'A': [1],
  'B': [1, 2],
  'C': [1, 4],
  'D': [1, 4, 5],
  'E': [1, 5],
  'F': [1, 2, 4],
  'G': [1, 2, 4, 5],
  'H': [1, 2, 5],
  'I': [2, 4],
  'J': [2, 4, 5],
  'K': [1, 3],
  'L': [1, 2, 3],
  'M': [1, 3, 4],
  'N': [1, 3, 4, 5],
  'O': [1, 3, 5],
  'P': [1, 2, 3, 4],
  'Q': [1, 2, 3, 4, 5],
  'R': [1, 2, 3, 5],
  'S': [2, 3, 4],
  'T': [2, 3, 4, 5],
  'U': [1, 3, 6],
  'V': [1, 2, 3, 6],
  'W': [2, 4, 5, 6],
  'X': [1, 3, 4, 6],
  'Y': [1, 3, 4, 5, 6],
  'Z': [1, 3, 5, 6],
};

// 점자 숫자 매핑 (0-9)
export const BRAILLE_NUMBERS: Record<string, number[]> = {
  '0': [2, 4, 5],  // J와 동일
  '1': [1],        // A와 동일
  '2': [1, 2],     // B와 동일
  '3': [1, 4],     // C와 동일
  '4': [1, 4, 5],  // D와 동일
  '5': [1, 5],     // E와 동일
  '6': [1, 2, 4],  // F와 동일
  '7': [1, 2, 4, 5], // G와 동일
  '8': [1, 2, 5],  // H와 동일
  '9': [2, 4],     // I와 동일
};

// 숫자 접두사 (숫자임을 나타내는 표시)
export const BRAILLE_NUMBER_PREFIX = [3, 4, 5, 6];

// 점자 입력 장치 명령어 (8비트)
export const BRAILLE_COMMANDS = {
  BACKSPACE: 0b10000000, // 128
  ENTER: 0b01000000,     // 64
  INPUT_1: 0b01100000,   // 96
  INPUT_2: 0b01010000,   // 80
  INPUT_3: 0b01001000,   // 72
  INPUT_4: 0b01000100,   // 68
  INPUT_5: 0b01000010,   // 66
  INPUT_6: 0b01000001,   // 65
};

// 8비트 입력에서 점자 점 번호 추출
export function parseInputBits(input: number): number[] {
  const dots: number[] = [];
  
  // 특별 명령어 확인
  if (input === BRAILLE_COMMANDS.BACKSPACE) {
    return [-1]; // 백스페이스 표시
  }
  if (input === BRAILLE_COMMANDS.ENTER) {
    return [-2]; // 엔터 표시
  }
  
  // 점자 입력 확인 (앞의 2비트가 01인 경우)
  if ((input & 0b11000000) === 0b01000000) {
    // 각 점 확인
    if (input & 0b00100000) dots.push(1); // 3번째 비트
    if (input & 0b00010000) dots.push(2); // 4번째 비트
    if (input & 0b00001000) dots.push(3); // 5번째 비트
    if (input & 0b00000100) dots.push(4); // 6번째 비트
    if (input & 0b00000010) dots.push(5); // 7번째 비트
    if (input & 0b00000001) dots.push(6); // 8번째 비트
  }
  
  return dots;
}

// 점자 점 배열에서 문자 찾기
export function findCharacterFromDots(dots: number[]): string | null {
  // 영문자 검색
  for (const [char, charDots] of Object.entries(BRAILLE_ALPHABET)) {
    if (arraysEqual(dots, charDots)) {
      return char;
    }
  }
  
  // 숫자 검색 (숫자 접두사 확인은 별도 로직에서 처리)
  for (const [num, numDots] of Object.entries(BRAILLE_NUMBERS)) {
    if (arraysEqual(dots, numDots)) {
      return num;
    }
  }
  
  return null;
}

// 문자에서 점자 점 배열 가져오기
export function getDotsFromCharacter(char: string): number[] | null {
  const upperChar = char.toUpperCase();
  
  if (BRAILLE_ALPHABET[upperChar]) {
    return BRAILLE_ALPHABET[upperChar];
  }
  
  if (BRAILLE_NUMBERS[char]) {
    return BRAILLE_NUMBERS[char];
  }
  
  return null;
}

// 배열 비교 함수
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

// 점자 시각적 표현 생성 (6점 점자)
export function generateBraillePattern(dots: number[]): string {
  const pattern = [
    ['⠀', '⠁'], // 점 1
    ['⠀', '⠂'], // 점 2
    ['⠀', '⠄'], // 점 3
    ['⠀', '⠈'], // 점 4
    ['⠀', '⠐'], // 점 5
    ['⠀', '⠠'], // 점 6
  ];
  
  let result = '⠀'; // 빈 점자 문자로 시작
  
  dots.forEach(dot => {
    if (dot >= 1 && dot <= 6) {
      const unicode = 0x2800 + Math.pow(2, dot - 1);
      result = String.fromCharCode(0x2800 + dots.reduce((acc, d) => acc + Math.pow(2, d - 1), 0));
    }
  });
  
  return result;
}
