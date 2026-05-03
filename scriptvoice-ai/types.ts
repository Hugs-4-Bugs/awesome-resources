export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  role: 'user' | 'admin';
  joinedAt: string;
  generationsCount: number;
  password?: string; // Only used for simulated DB auth, not exposed in session usually
}

export interface VoiceProfile {
  id: string;
  name: string;
  geminiVoice: string; // The actual API voice name
  gender: 'Male' | 'Female';
  tags: string[];
  description: string;
  avatarGradient: string;
}

export interface VoiceSettings {
  speed: number;
  stability: number;
  similarity: number;
  styleExaggeration: number;
  speakerBoost: boolean;
}

export interface ScriptSegment {
  id: string;
  timestamp: string;
  visualDescription: string;
  voText: string;
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  isGenerating: boolean;
}

export interface GenerationHistoryItem {
  id: string;
  title: string;
  textSnippet: string;
  fullText: string;
  voiceName: string;
  timestamp: string;
}

export const DEFAULT_SETTINGS: VoiceSettings = {
  speed: 1.0,
  stability: 0.5,
  similarity: 0.75,
  styleExaggeration: 0.0,
  speakerBoost: true,
};

// Map user personas to available Gemini 2.5 voices
// Available: Kore, Puck, Charon, Fenrir, Zephyr
export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'mona',
    name: 'Mona',
    geminiVoice: 'Zephyr', 
    gender: 'Female',
    tags: ['Energetic', 'Social Media', 'Reels'],
    description: 'Energetic, reels perfect for social media promo.',
    avatarGradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'isha',
    name: 'Isha',
    geminiVoice: 'Kore',
    gender: 'Female',
    tags: ['Storytelling', 'Touching', 'Engaging'],
    description: 'Engaging and touching tone, perfect for storytelling.',
    avatarGradient: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'priya',
    name: 'Priya',
    geminiVoice: 'Kore',
    gender: 'Female',
    tags: ['Sweet', 'Clear', 'Narrative'],
    description: 'Storytelling, engaging, clear, and sweet.',
    avatarGradient: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'rahul',
    name: 'Rahul',
    geminiVoice: 'Charon',
    gender: 'Male',
    tags: ['Deep', 'Meaningful', 'Authoritative'],
    description: 'Male voice, meaningful and deep tone.',
    avatarGradient: 'from-amber-500 to-orange-600'
  }
];

export const INITIAL_TEXT = '';