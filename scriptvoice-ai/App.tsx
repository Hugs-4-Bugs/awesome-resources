import React, { useState, useEffect } from 'react';
import { INITIAL_TEXT, VoiceProfile, VOICE_PROFILES, VoiceSettings, DEFAULT_SETTINGS, User, GenerationHistoryItem } from './types';
import HomeView from './components/HomeView';
import VoicesView from './components/VoicesView';
import TextToSpeechView from './components/TextToSpeechView';
import PlaygroundView from './components/PlaygroundView';
import AuthView from './components/AuthView';
import AdminView from './components/AdminView';
import { 
  HomeIcon, 
  VoiceIcon, 
  StudioIcon, 
  TextToSpeechIcon, 
  LogOutIcon
} from './components/Icons';

type View = 'home' | 'voices' | 'playground' | 'tts' | 'admin';

function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState<View>('home');

  // Shared Data State
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [selectedVoiceProfile, setSelectedVoiceProfile] = useState<VoiceProfile>(VOICE_PROFILES[0]);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  
  // History State
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  // Load user session on mount
  useEffect(() => {
    const savedUserStr = localStorage.getItem('sv_user_session');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        setUser(savedUser);
      } catch (e) {
        console.error("Failed to parse user session");
      }
    }
  }, []);

  // DATA ISOLATION LOGIC
  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
        // Logged in: Try to load user specific script
        const userScript = localStorage.getItem(`sv_user_data_${user.id}_script`);
        if (userScript) {
            setText(userScript);
        } else {
            // New user or no data: RESET to initial state
            setText(INITIAL_TEXT);
        }

        // Logged in: Load History
        const savedHistory = localStorage.getItem(`sv_user_data_${user.id}_history`);
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                setHistory([]);
            }
        } else {
            setHistory([]);
        }

    } else {
        // Logged out / Guest: 
        // 1. Reset text to initial
        setText(INITIAL_TEXT);
        // 2. Wipe history from view (Guest starts fresh on refresh, but we also clear on explicit logout)
        setHistory([]);
    }
  }, [user]);

  // Save text whenever it changes (auto-save for logged in user)
  useEffect(() => {
    if (user) {
        localStorage.setItem(`sv_user_data_${user.id}_script`, text);
    }
  }, [text, user]);

  // Save History whenever it changes (only for logged in user)
  useEffect(() => {
    if (user) {
        localStorage.setItem(`sv_user_data_${user.id}_history`, JSON.stringify(history));
    }
    // Note: If user is null (guest), we do NOT save to localStorage. 
    // This ensures data is transient and wipes on refresh.
  }, [history, user]);

  const addToHistory = (item: GenerationHistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  const handleOpenHistoryItem = (item: GenerationHistoryItem) => {
      // Confirm before overwriting current work
      if(window.confirm('Opening this project will replace your current script text. Do you want to continue?')) {
          setText(item.fullText);
          
          // Try to match voice if possible
          const voice = VOICE_PROFILES.find(v => v.name === item.voiceName);
          if (voice) setSelectedVoiceProfile(voice);
          
          setCurrentView('tts');
      }
  };

  // Handle Login & Database Sync
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('sv_user_session', JSON.stringify(newUser));
    setShowAuthModal(false);

    // -- DATABASE LOGIC --
    // Sync to "Simulated Database" in LocalStorage for Admin Panel
    const dbString = localStorage.getItem('sv_users_db');
    let db: User[] = dbString ? JSON.parse(dbString) : [];
    
    // Check if user exists to update last active info or stats
    const existingIndex = db.findIndex(u => u.email === newUser.email);
    
    if (existingIndex >= 0) {
        const dbUser = db[existingIndex];
        db[existingIndex] = { 
            ...dbUser,
            ...newUser, 
            password: dbUser.password, // Preserve password
            generationsCount: dbUser.generationsCount || 0 
        };
    } else {
        // Add new user (Signup)
        db.push(newUser);
    }
    
    localStorage.setItem('sv_users_db', JSON.stringify(db));
    
    // Redirect if Admin
    if (newUser.role === 'admin') {
        setCurrentView('admin');
    }
  };

  const handleIncrementGeneration = () => {
    if (!user) return; // Anonymous generations not tracked in DB yet

    // Update in Session
    const updatedUser = { ...user, generationsCount: (user.generationsCount || 0) + 1 };
    setUser(updatedUser);
    localStorage.setItem('sv_user_session', JSON.stringify(updatedUser));

    // Update in DB
    const dbString = localStorage.getItem('sv_users_db');
    if (dbString) {
        const db: User[] = JSON.parse(dbString);
        const index = db.findIndex(u => u.email === user.email);
        if (index >= 0) {
            db[index].generationsCount = (db[index].generationsCount || 0) + 1;
            localStorage.setItem('sv_users_db', JSON.stringify(db));
        }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sv_user_session');
    // Set user to null, which triggers the useEffect to reset 'text' and 'history'
    setUser(null);
    if (currentView === 'admin') setCurrentView('home');
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const handleVoiceSelect = (voice: VoiceProfile) => {
    setSelectedVoiceProfile(voice);
    setCurrentView('tts');
  };

  // Auth Modal Component
  const AuthOverlay = showAuthModal ? (
    <AuthView onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />
  ) : null;

  return (
    <div className="flex h-screen bg-white text-gray-800 overflow-hidden font-sans relative">
      
      {AuthOverlay}

      {/* Sidebar (Left) - Navigation */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col z-20">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-black text-white flex items-center justify-center text-xs">SV</span>
                ScriptVoice
            </h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
            <button 
                onClick={() => handleNavigate('home')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'home' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <HomeIcon className="w-5 h-5" /> Home
            </button>
            <button 
                onClick={() => handleNavigate('voices')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'voices' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <VoiceIcon className="w-5 h-5" /> Voices
            </button>
            <button 
                onClick={() => handleNavigate('playground')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'playground' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <StudioIcon className="w-5 h-5" /> Playground
            </button>
            <div className="pt-4 pb-2 px-3"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tools</p></div>
            <button 
                onClick={() => handleNavigate('tts')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'tts' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <TextToSpeechIcon className="w-5 h-5" /> Text to Speech
            </button>

            {/* Admin Link - Only visible to admins */}
            {user?.role === 'admin' && (
                <>
                <div className="pt-4 pb-2 px-3"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p></div>
                <button 
                    onClick={() => handleNavigate('admin')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'admin' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Dashboard
                </button>
                </>
            )}
        </nav>
        
        {/* User Profile Stub */}
        <div className="p-4 border-t border-gray-100">
             {user ? (
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                             {user.name[0].toUpperCase()}
                         </div>
                         <div className="text-sm overflow-hidden">
                             <div className="font-medium text-gray-900 truncate w-24">{user.name}</div>
                             <div className="text-xs text-gray-500">{user.plan} Plan</div>
                         </div>
                     </div>
                     <button 
                        onClick={handleLogout}
                        className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
                        title="Sign Out"
                     >
                        <LogOutIcon className="w-4 h-4" />
                     </button>
                 </div>
             ) : (
                <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-black text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Log In / Sign Up
                </button>
             )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-white">
        {currentView === 'home' && (
            <HomeView 
                onNavigate={handleNavigate} 
                history={history} 
                onOpenHistory={handleOpenHistoryItem}
            />
        )}
        {currentView === 'voices' && (
            <VoicesView 
                currentVoiceId={selectedVoiceProfile.id} 
                onSelectVoice={handleVoiceSelect} 
            />
        )}
        {currentView === 'playground' && <PlaygroundView />}
        {currentView === 'tts' && (
            <TextToSpeechView 
                text={text}
                setText={setText}
                selectedVoiceProfile={selectedVoiceProfile}
                setSelectedVoiceProfile={setSelectedVoiceProfile}
                settings={settings}
                setSettings={setSettings}
                user={user}
                onShowAuth={() => setShowAuthModal(true)}
                onIncrementGeneration={handleIncrementGeneration}
                onAddToHistory={addToHistory}
            />
        )}
        {currentView === 'admin' && user?.role === 'admin' && (
            <AdminView />
        )}
      </div>

    </div>
  );
}

export default App;
