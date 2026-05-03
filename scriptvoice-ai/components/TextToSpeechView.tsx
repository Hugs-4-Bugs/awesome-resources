import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceProfile, VOICE_PROFILES, VoiceSettings, DEFAULT_SETTINGS, User, GenerationHistoryItem } from '../types';
import { generateSpeechForText } from '../services/geminiService';
import { playBuffer, audioBufferToWav } from '../services/audioUtils';
import { 
  SparklesIcon, 
  PlayIcon,
  PauseIcon,
  DownloadIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LoaderIcon,
  CheckIcon
} from './Icons';

interface TextToSpeechViewProps {
  text: string;
  setText: (text: string) => void;
  selectedVoiceProfile: VoiceProfile;
  setSelectedVoiceProfile: (voice: VoiceProfile) => void;
  settings: VoiceSettings;
  setSettings: (settings: VoiceSettings) => void;
  user: User | null;
  onShowAuth: () => void;
  onIncrementGeneration: () => void;
  onAddToHistory: (item: GenerationHistoryItem) => void;
}

const TextToSpeechView: React.FC<TextToSpeechViewProps> = ({
  text,
  setText,
  selectedVoiceProfile,
  setSelectedVoiceProfile,
  settings,
  setSettings,
  user,
  onShowAuth,
  onIncrementGeneration,
  onAddToHistory
}) => {
  // Audio State (local to view)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<AudioBuffer | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // UI State
  const [showVoiceList, setShowVoiceList] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  // Refs
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Audio Context - robust handling for browser suspension
  const getAudioContext = useCallback(async () => {
    let ctx = audioContext;
    
    // Create new context if doesn't exist or is closed
    if (!ctx || ctx.state === 'closed') {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      setAudioContext(ctx);
    }

    // Resume if suspended (common after tab switching/inactivity)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    return ctx;
  }, [audioContext]);

  // Handle Generation
  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    setGeneratedAudio(null);
    setIsPlaying(false);

    try {
      // 1. Initialize/Resume Audio Context immediately on user click
      const ctx = await getAudioContext();

      // 2. Call API
      const buffer = await generateSpeechForText(
        text, 
        selectedVoiceProfile.geminiVoice,
        ctx
      );
      setGeneratedAudio(buffer);
      onIncrementGeneration();

      // 3. Add to History (Only acts if App passes down logic, which handles auth check)
      const historyItem: GenerationHistoryItem = {
          id: Date.now().toString(),
          title: text.length > 20 ? text.substring(0, 20) + "..." : text,
          textSnippet: text.substring(0, 60),
          fullText: text,
          voiceName: selectedVoiceProfile.name,
          timestamp: new Date().toISOString()
      };
      onAddToHistory(historyItem);

    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate audio. Please check your connection or try refreshing the page.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Play/Pause
  const togglePlay = async () => {
    if (!generatedAudio) return;
    
    const ctx = await getAudioContext();

    if (isPlaying) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const source = playBuffer(ctx, generatedAudio, () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      }, settings.speed);
      audioSourceRef.current = source;
      setIsPlaying(true);
    }
  };

  // Handle Download - The Guarded Action
  const handleDownload = () => {
    if (!generatedAudio) return;

    // AUTH GUARD: If no user, show modal and return
    if (!user) {
        onShowAuth();
        return;
    }

    const wavBlob = audioBufferToWav(generatedAudio);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scriptvoice-${selectedVoiceProfile.name}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
    };
  }, []);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Main Content (Center) - Script Editor */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white z-10">
            <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-black">Script Editor</span>
            </div>
            <div className="flex items-center gap-3">
                 <button className="text-sm font-medium text-gray-500 hover:text-black">Feedback</button>
            </div>
        </div>

        <div className="flex-1 flex flex-col p-8 relative overflow-y-auto">
            <div className="mb-4">
                <h2 className="text-2xl font-bold mb-1">
                    {user ? 'Your Project' : 'Untitled Project'}
                </h2>
                <p className="text-gray-500 text-sm">
                    {user ? 'Changes are saved automatically.' : 'Changes are temporary. Log in to save.'}
                </p>
            </div>
            
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow min-h-[400px]">
                <textarea 
                    className="flex-1 w-full p-6 resize-none outline-none text-lg text-gray-800 leading-relaxed font-medium placeholder-gray-300"
                    placeholder="Start typing here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                />
                
                {/* Bottom Action Bar inside Textarea container */}
                <div className="h-16 border-t border-gray-100 bg-gray-50 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="text-xs text-gray-500 font-mono">
                        {text.length} chars
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {generatedAudio && (
                             <div className="flex items-center gap-2 mr-2 animate-fadeIn">
                                <button 
                                    onClick={togglePlay}
                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-black shadow-sm"
                                >
                                    {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                                </button>
                                <button 
                                    onClick={handleDownload}
                                    className="w-10 h-10 rounded-full bg-indigo-600 border border-indigo-600 flex items-center justify-center hover:bg-indigo-700 transition-colors text-white shadow-sm"
                                    title={user ? "Download WAV" : "Login to Download"}
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                </button>
                             </div>
                        )}
                        
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !text.trim()}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                                isGenerating 
                                ? 'bg-gray-800 text-gray-300 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-900 hover:shadow-lg'
                            }`}
                        >
                            {isGenerating ? (
                                <>
                                    <LoaderIcon className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate Speech
                                    <SparklesIcon className="w-4 h-4 text-gray-400" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Right Panel - Settings & Voice Selection */}
      <aside className="w-80 bg-white border-l border-gray-100 flex-shrink-0 flex flex-col overflow-y-auto">
         
         {/* Voice Selector Section */}
         <div className="p-4 border-b border-gray-100">
             <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Voice</label>
             <div className="relative">
                 <button 
                    onClick={() => setShowVoiceList(!showVoiceList)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-gray-300 bg-white transition-colors text-left"
                 >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedVoiceProfile.avatarGradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {selectedVoiceProfile.name[0]}
                        </div>
                        <div className="truncate">
                            <div className="text-sm font-semibold text-gray-900 truncate">{selectedVoiceProfile.name}</div>
                            <div className="text-xs text-gray-500 truncate">{selectedVoiceProfile.description}</div>
                        </div>
                    </div>
                    <ChevronRightIcon className={`w-4 h-4 text-gray-400 transition-transform ${showVoiceList ? 'rotate-90' : ''}`} />
                 </button>
                 
                 {/* Dropdown list for voices */}
                 {showVoiceList && (
                     <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto p-1">
                         {VOICE_PROFILES.map(profile => (
                             <div 
                                key={profile.id}
                                onClick={() => { setSelectedVoiceProfile(profile); setShowVoiceList(false); }}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedVoiceProfile.id === profile.id ? 'bg-gray-50' : ''}`}
                             >
                                 <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${profile.avatarGradient} flex items-center justify-center text-white text-xs font-bold`}>
                                     {profile.name[0]}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                                     <div className="text-xs text-gray-500 truncate">{profile.tags.join(', ')}</div>
                                 </div>
                                 {selectedVoiceProfile.id === profile.id && <CheckIcon className="w-4 h-4 text-indigo-600" />}
                             </div>
                         ))}
                     </div>
                 )}
             </div>
         </div>

         {/* Settings Section */}
         <div className="p-4 space-y-6">
            
            {/* Model Card (Static for visual) */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Model</label>
                <div className="p-3 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="px-1.5 py-0.5 border border-gray-800 rounded text-[10px] font-bold">V2</div>
                        <span className="text-sm font-medium">Gemini 1.5 pro</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Custom Settings Accordion */}
            <div>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase mb-4 hover:text-gray-800"
                >
                    <span>Voice Settings</span>
                    {showSettings ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                </button>

                {showSettings && (
                    <div className="space-y-6 animate-fadeIn">
                        
                        {/* Speed Slider (Real) */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span className="font-medium text-gray-700">Speed</span>
                                <span>{settings.speed}x</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.25" 
                                max="2.0" 
                                step="0.05"
                                value={settings.speed}
                                onChange={(e) => setSettings({...settings, speed: parseFloat(e.target.value)})}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>Slower</span>
                                <span>Faster</span>
                            </div>
                        </div>

                        {/* Stability Slider (Visual Only) */}
                        <div className="space-y-2 opacity-60">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span className="font-medium text-gray-700">Stability</span>
                                <span>{Math.round(settings.stability * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01"
                                value={settings.stability}
                                onChange={(e) => setSettings({...settings, stability: parseFloat(e.target.value)})}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>More variable</span>
                                <span>More stable</span>
                            </div>
                        </div>

                        {/* Similarity Slider (Visual Only) */}
                        <div className="space-y-2 opacity-60">
                             <div className="flex justify-between text-xs text-gray-500">
                                <span className="font-medium text-gray-700">Similarity</span>
                                <span>{Math.round(settings.similarity * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01"
                                value={settings.similarity}
                                onChange={(e) => setSettings({...settings, similarity: parseFloat(e.target.value)})}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>

                        {/* Style Exaggeration (Visual Only) */}
                        <div className="space-y-2 opacity-60">
                             <div className="flex justify-between text-xs text-gray-500">
                                <span className="font-medium text-gray-700">Style Exaggeration</span>
                                <span>{Math.round(settings.styleExaggeration * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01"
                                value={settings.styleExaggeration}
                                onChange={(e) => setSettings({...settings, styleExaggeration: parseFloat(e.target.value)})}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>None</span>
                                <span>Exaggerated</span>
                            </div>
                        </div>

                        {/* Speaker Boost Toggle */}
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-medium text-gray-700">Speaker boost</span>
                            <button 
                                onClick={() => setSettings({...settings, speakerBoost: !settings.speakerBoost})}
                                className={`w-10 h-5 rounded-full relative transition-colors ${settings.speakerBoost ? 'bg-black' : 'bg-gray-200'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.speakerBoost ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>
                        
                        <div className="flex justify-end">
                             <button 
                                onClick={() => setSettings(DEFAULT_SETTINGS)}
                                className="text-xs text-gray-500 flex items-center gap-1 hover:text-black"
                             >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                Reset values
                             </button>
                        </div>

                    </div>
                )}
            </div>
         </div>
      </aside>
    </div>
  );
};

export default TextToSpeechView;