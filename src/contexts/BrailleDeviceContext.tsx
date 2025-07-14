import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrailleSerialDevice } from '../utils/serialDevice';

interface BrailleDeviceContextType {
  serialDevice: BrailleSerialDevice | null;
  isConnected: boolean;
  connectDevice: () => Promise<void>;
  disconnectDevice: () => Promise<void>;
  setOnDataCallback: (callback: (data: number) => void) => void;
}

const BrailleDeviceContext = createContext<BrailleDeviceContextType | undefined>(undefined);

export const useBrailleDevice = () => {
  const context = useContext(BrailleDeviceContext);
  if (context === undefined) {
    throw new Error('useBrailleDevice must be used within a BrailleDeviceProvider');
  }
  return context;
};

interface BrailleDeviceProviderProps {
  children: ReactNode;
}

export const BrailleDeviceProvider: React.FC<BrailleDeviceProviderProps> = ({ children }) => {
  const [serialDevice, setSerialDevice] = useState<BrailleSerialDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectDevice = async () => {
    try {
      console.log('Attempting to connect to Braille device...');
      const device = new BrailleSerialDevice();
      const connected = await device.connect();
      if (!connected) {
      throw new Error('Device connection returned false');
      }
      setSerialDevice(device);
      setIsConnected(true);
      console.log('✅ Successfully connected to Braille device');
    } catch (error) {
      console.error('❌ Failed to connect to device:', error);
      import('sweetalert2').then(({ default: Swal }) => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: "Failed to connect to Braille device. Make sure it's connected and try again.",
          showConfirmButton: false,
          timer: 5000,
        });
      });
    }
  };

  const disconnectDevice = async () => {
    if (serialDevice) {
      console.log('Disconnecting from Braille device...');
      await serialDevice.disconnect();
      setSerialDevice(null);
      setIsConnected(false);
      console.log('✅ Disconnected from Braille device');
    }
  };

  const setOnDataCallback = (callback: (data: number) => void) => {
    if (serialDevice && isConnected) {
      serialDevice.setOnDataCallback(callback);
    }
  };

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      if (serialDevice && isConnected) {
        disconnectDevice();
      }
    };
  }, []);

  const value: BrailleDeviceContextType = {
    serialDevice,
    isConnected,
    connectDevice,
    disconnectDevice,
    setOnDataCallback,
  };

  return (
    <BrailleDeviceContext.Provider value={value}>
      {children}
    </BrailleDeviceContext.Provider>
  );
};
