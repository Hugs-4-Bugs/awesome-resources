import React, { useMemo } from 'react';
import { TextToSpeechIcon, VoiceIcon, StudioIcon, SparklesIcon } from './Icons';
import { GenerationHistoryItem } from '../types';

interface HomeViewProps {
  onNavigate: (view: any) => void;
  history: GenerationHistoryItem[];
  onOpenHistory: (item: GenerationHistoryItem) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, history, onOpenHistory }) => {
  
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{greeting}, Creator</h1>
        <p className="text-gray-500">What would you like to create today?</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <button 
          onClick={() => onNavigate('tts')}
          className="p-6 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TextToSpeechIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Text to Speech</h3>
          <p className="text-sm text-gray-500">Turn your scripts into lifelike audio using advanced AI voices.</p>
        </button>

        <button 
          onClick={() => onNavigate('voices')}
          className="p-6 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <VoiceIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Voice Library</h3>
          <p className="text-sm text-gray-500">Explore our collection of expressive characters and voices.</p>
        </button>

        <button 
          onClick={() => onNavigate('playground')}
          className="p-6 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <StudioIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Playground</h3>
          <p className="text-sm text-gray-500">Experiment with prompts and voice settings in a sandbox.</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Generations</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden min-h-[120px]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <p>No recent generations found.</p>
                <button onClick={() => onNavigate('tts')} className="mt-2 text-indigo-600 hover:underline text-sm font-medium">Create your first voiceover</button>
            </div>
          ) : (
            history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <SparklesIcon className="w-5 h-5" />
                    </div>
                    <div>
                    <div className="font-medium text-gray-900">{item.title || 'Untitled Project'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span>•</span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{item.voiceName}</span>
                    </div>
                    </div>
                </div>
                <button 
                    onClick={() => onOpenHistory(item)} 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                    Open
                </button>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;