import React from 'react';
import { VOICE_PROFILES, VoiceProfile } from '../types';
import { CheckIcon, PlayIcon } from './Icons';

interface VoicesViewProps {
  currentVoiceId: string;
  onSelectVoice: (voice: VoiceProfile) => void;
}

const VoicesView: React.FC<VoicesViewProps> = ({ currentVoiceId, onSelectVoice }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full flex flex-col">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voice Lab</h1>
          <p className="text-gray-500">Discover the perfect voice for your story.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-20">
        {VOICE_PROFILES.map((profile) => {
          const isSelected = currentVoiceId === profile.id;
          return (
            <div 
              key={profile.id}
              onClick={() => onSelectVoice(profile)}
              className={`relative group bg-white border rounded-xl p-5 transition-all cursor-pointer hover:shadow-lg ${
                isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${profile.avatarGradient} flex items-center justify-center text-white text-lg font-bold shadow-sm`}>
                  {profile.name[0]}
                </div>
                {isSelected && (
                  <div className="bg-indigo-100 text-indigo-700 p-1 rounded-full">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-gray-900 mb-1">{profile.name}</h3>
              <div className="text-xs text-gray-500 mb-3">{profile.gender} • {profile.geminiVoice}</div>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {profile.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {profile.description}
              </p>

              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-white via-white to-transparent pt-10 rounded-b-xl flex justify-center">
                 <button className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    {isSelected ? 'Selected' : 'Use Voice'}
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VoicesView;
