// Web Serial API 타입 정의
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  getInfo(): SerialPortInfo;
}

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface Navigator {
  serial: {
    requestPort(options?: { filters: Array<{ usbVendorId?: number; usbProductId?: number }> }): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
}

export class BrailleSerialDevice {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isConnected = false;
  private onDataCallback: ((data: number) => void) | null = null;

  // Web Serial API 지원 확인
  static isSupported(): boolean {
    return 'serial' in navigator;
  }

  // 포트 연결
  async connect(): Promise<boolean> {
    try {
      if (!BrailleSerialDevice.isSupported()) {
        throw new Error('Web Serial API is not supported in this browser');
      }

      // 포트 요청
      this.port = await (navigator as any).serial.requestPort();
      
      // 포트 열기 (Arduino 기본 보드레이트: 115200)
      await this.port.open({ baudRate: 115200 });
      
      this.isConnected = true;
      this.startReading();
      
      return true;
    } catch (error) {
      console.error('Failed to connect to serial device:', error);
      return false;
    }
  }

  // 포트 연결 해제
  async disconnect(): Promise<void> {
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      
      this.isConnected = false;
    } catch (error) {
      console.error('Failed to disconnect from serial device:', error);
    }
  }

  // 데이터 읽기 시작
  private async startReading(): Promise<void> {
    if (!this.port || !this.port.readable) {
      return;
    }

    this.reader = this.port.readable.getReader();

    try {
      while (this.isConnected) {
        const { value, done } = await this.reader.read();
        
        if (done) {
          break;
        }

        // 받은 데이터 처리
        if (value && value.length > 0) {
          for (const byte of value) {
            if (this.onDataCallback) {
              this.onDataCallback(byte);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading from serial device:', error);
    } finally {
      if (this.reader) {
        this.reader.releaseLock();
        this.reader = null;
      }
    }
  }

  // 데이터 수신 콜백 설정
  setOnDataCallback(callback: (data: number) => void): void {
    this.onDataCallback = callback;
  }

  // 연결 상태 확인
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 데이터 전송 (Arduino로 피드백 전송용)
  async sendData(data: Uint8Array): Promise<boolean> {
    try {
      if (!this.port || !this.port.writable) {
        return false;
      }

      const writer = this.port.writable.getWriter();
      await writer.write(data);
      writer.releaseLock();
      
      return true;
    } catch (error) {
      console.error('Failed to send data to serial device:', error);
      return false;
    }
  }
}

// 전역 시리얼 디바이스 인스턴스
export const brailleDevice = new BrailleSerialDevice();
