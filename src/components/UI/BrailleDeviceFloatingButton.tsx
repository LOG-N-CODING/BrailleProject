import React, { useState } from 'react';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';

const BrailleDeviceFloatingButton: React.FC = () => {
  const { isConnected, connectDevice, disconnectDevice } = useBrailleDevice();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleConnection = async () => {
    if (isConnected) {
      await disconnectDevice();
    } else {
      await connectDevice();
    }
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border p-4 min-w-[250px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Braille Device</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>

          <button
            onClick={handleToggleConnection}
            className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
              isConnected
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {isConnected ? 'Disconnect Device' : 'Connect Device'}
          </button>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isConnected
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-500 hover:bg-gray-600 text-white'
        } ${isExpanded ? 'border border-[3px] border-black' : ''}`}
      >
        {isConnected ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default BrailleDeviceFloatingButton;
