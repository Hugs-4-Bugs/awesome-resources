import React from 'react';
import { StudioIcon } from './Icons';

const PlaygroundView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full bg-gray-50">
      <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mb-6">
        <StudioIcon className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Playground Mode</h2>
      <p className="text-gray-500 max-w-md mb-8">
        A sandbox environment for testing prompt engineering and voice parameters is coming soon.
      </p>
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100 max-w-lg">
        <strong>Note:</strong> Please use the <strong>Text to Speech</strong> editor for all generation tasks currently. It includes full voice controls and script management.
      </div>
    </div>
  );
};

export default PlaygroundView;
