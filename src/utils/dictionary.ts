// Free Dictionary API 타입 정의
export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
    sourceUrl?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      synonyms?: string[];
      antonyms?: string[];
      example?: string;
    }>;
    synonyms?: string[];
    antonyms?: string[];
  }>;
  license: {
    name: string;
    url: string;
  };
  sourceUrls: string[];
}

// Dictionary API 서비스 클래스
export class DictionaryService {
  private baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

  // 단어 검색
  async searchWord(word: string): Promise<DictionaryEntry[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // 단어를 찾을 수 없음
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DictionaryEntry[] = await response.json();
      return data;
    } catch (error) {
      console.error('Dictionary API error:', error);
      return null;
    }
  }

  // 발음 오디오 재생
  async playPronunciation(word: string): Promise<boolean> {
    try {
      const entries = await this.searchWord(word);
      
      if (!entries || entries.length === 0) {
        return false;
      }

      // 첫 번째 항목에서 오디오 찾기
      for (const entry of entries) {
        for (const phonetic of entry.phonetics) {
          if (phonetic.audio) {
            const audio = new Audio(phonetic.audio);
            await audio.play();
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
      return false;
    }
  }

  // 단어의 첫 번째 정의 가져오기
  getFirstDefinition(entries: DictionaryEntry[]): string | null {
    if (!entries || entries.length === 0) {
      return null;
    }

    const firstEntry = entries[0];
    if (firstEntry.meanings && firstEntry.meanings.length > 0) {
      const firstMeaning = firstEntry.meanings[0];
      if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
        return firstMeaning.definitions[0].definition;
      }
    }

    return null;
  }

  // 발음 기호 가져오기
  getPhonetic(entries: DictionaryEntry[]): string | null {
    if (!entries || entries.length === 0) {
      return null;
    }

    const firstEntry = entries[0];
    
    // 전체 phonetic 확인
    if (firstEntry.phonetic) {
      return firstEntry.phonetic;
    }

    // phonetics 배열에서 찾기
    for (const phonetic of firstEntry.phonetics) {
      if (phonetic.text) {
        return phonetic.text;
      }
    }

    return null;
  }

  // 품사 가져오기
  getPartOfSpeech(entries: DictionaryEntry[]): string | null {
    if (!entries || entries.length === 0) {
      return null;
    }

    const firstEntry = entries[0];
    if (firstEntry.meanings && firstEntry.meanings.length > 0) {
      return firstEntry.meanings[0].partOfSpeech;
    }

    return null;
  }

  // 예문 가져오기
  getExample(entries: DictionaryEntry[]): string | null {
    if (!entries || entries.length === 0) {
      return null;
    }

    const firstEntry = entries[0];
    for (const meaning of firstEntry.meanings) {
      for (const definition of meaning.definitions) {
        if (definition.example) {
          return definition.example;
        }
      }
    }

    return null;
  }
}

// 전역 Dictionary 서비스 인스턴스
export const dictionaryService = new DictionaryService();
