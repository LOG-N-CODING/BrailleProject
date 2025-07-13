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
  INPUT_1: 0b01100000,   // 96 (특별 케이스)
  // 0b00?????? 패턴: 하위 6비트가 점자 6개 점에 대응
  // 예시:
  // INPUT_2: 0b00010000,   // 16 (점 2)
  // INPUT_3: 0b00001000,   // 8 (점 3)
  // INPUT_4: 0b00000100,   // 4 (점 4)
  // INPUT_5: 0b00000010,   // 2 (점 5)
  // INPUT_6: 0b00000001,   // 1 (점 6)
  // INPUT_123: 0b00111000, // 56 (점 1,2,3)
  // 등등... 0~63 범위의 모든 조합 가능
};

// 8비트 입력에서 점자 점 번호 추출
export function parseInputBits(input: number): number[] {
  const dots: number[] = [];
  
  // 입력 값 로그 출력
  console.log(`입력 받은 값: ${input} (십진수), 0b${input.toString(2).padStart(8, '0')} (이진수)`);
  
  // 특별 명령어 확인
  if (input === BRAILLE_COMMANDS.BACKSPACE) {
    console.log('명령어: BACKSPACE 감지');
    return [-1]; // 백스페이스 표시
  }
  if (input === BRAILLE_COMMANDS.ENTER) {
    console.log('명령어: ENTER 감지');
    return [-2]; // 엔터 표시
  }
  
  // INPUT_1 특별 처리 (01100000)
  if (input === BRAILLE_COMMANDS.INPUT_1) {
    console.log('특별 명령어: INPUT_1 감지 (점 1)');
    return [1];
  }
  
  // 0b00?????? 패턴 확인 (상위 2비트가 00인 경우)
  if ((input & 0b11000000) === 0b00000000) {
    console.log('점자 입력 패턴 감지 (0b00??????)');
    // 하위 6비트를 점자 6개 점에 매핑
    if (input & 0b00100000) dots.push(1); // 6번째 비트 -> 점 1
    if (input & 0b00010000) dots.push(2); // 5번째 비트 -> 점 2
    if (input & 0b00001000) dots.push(3); // 4번째 비트 -> 점 3
    if (input & 0b00000100) dots.push(4); // 3번째 비트 -> 점 4
    if (input & 0b00000010) dots.push(5); // 2번째 비트 -> 점 5
    if (input & 0b00000001) dots.push(6); // 1번째 비트 -> 점 6
    console.log(`추출된 점자 점: [${dots.join(', ')}]`);
  } else {
    console.log('알 수 없는 입력 패턴');
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
