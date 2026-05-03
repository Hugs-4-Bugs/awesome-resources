import React, { useState } from 'react';
import { User } from '../types';
import { GoogleIcon } from './Icons';

interface AuthViewProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdminEmail = (email: string) => email.toLowerCase().includes('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // --- SECURITY & VALIDATION LOGIC ---
    const dbString = localStorage.getItem('sv_users_db');
    let db: User[] = dbString ? JSON.parse(dbString) : [];

    if (isLogin) {
        // LOGIN LOGIC
        const foundUser = db.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        // HIDDEN ADMIN BACKDOOR:
        // If the Master Admin tries to login but doesn't exist in DB (e.g. after clear), create it.
        // This ensures you always have access.
        if (!foundUser && email === 'admin@scriptvoice.ai' && password === 'admin123') {
             const newAdmin: User = {
                id: 'admin_master',
                name: 'System Admin',
                email: email,
                plan: 'Enterprise',
                role: 'admin',
                joinedAt: new Date().toISOString(),
                generationsCount: 999,
                password: password
            };
            onLogin(newAdmin);
            setIsLoading(false);
            return;
        }

        if (!foundUser) {
            setError("No account found with this email.");
            setIsLoading(false);
            return;
        }

        // Verify password
        if (foundUser.password !== password) {
            setError("Incorrect password.");
            setIsLoading(false);
            return;
        }

        // Success
        onLogin(foundUser);

    } else {
        // SIGN UP LOGIC
        const existingUser = db.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
            setError("An account with this email already exists. Please log in.");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setIsLoading(false);
            return;
        }

        const newUser: User = {
            id: email.replace(/[^a-zA-Z0-9]/g, '') + Date.now().toString().slice(-4),
            name: name || email.split('@')[0],
            email: email,
            plan: isAdminEmail(email) ? 'Enterprise' : 'Free',
            role: isAdminEmail(email) ? 'admin' : 'user',
            joinedAt: new Date().toISOString(),
            generationsCount: 0,
            password: password // Store password locally for validation
        };

        onLogin(newUser);
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate Unique Google User per session
    const googleId = `google_${Date.now()}`;
    const user: User = {
        id: googleId,
        name: 'Google User',
        email: `google_user_${Date.now().toString().slice(-4)}@gmail.com`,
        plan: 'Free',
        role: 'user',
        joinedAt: new Date().toISOString(),
        generationsCount: 0,
        password: 'google-oauth-token'
    };
    
    setIsLoading(false);
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-fadeIn">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="p-8">
            <div className="text-center mb-8">
                <div className="mx-auto h-12 w-12 rounded-xl bg-black text-white flex items-center justify-center text-lg font-bold shadow-lg mb-4">
                    SV
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {isLogin ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                {isLogin ? 'Sign in to access your projects.' : 'Join to save and download your work securely.'}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}

            {/* Google Login Button */}
            <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 transition-colors shadow-sm"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                ) : (
                    <GoogleIcon className="w-5 h-5" />
                )}
                <span>Continue with Google</span>
            </button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                <div>
                    <input
                        type="text"
                        required={!isLogin}
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black sm:text-sm transition-colors outline-none"
                    />
                </div>
                )}

                <div>
                    <input
                        type="email"
                        required
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black sm:text-sm transition-colors outline-none"
                    />
                </div>

                <div>
                    <input
                        type="password"
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black sm:text-sm transition-colors outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center rounded-lg bg-black py-3 px-4 text-sm font-bold text-white shadow-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all transform active:scale-95 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                            setEmail('');
                            setPassword('');
                        }}
                        className="font-bold text-black hover:underline"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 text-center">
            <p className="text-xs text-gray-500">
                By continuing, you agree to ScriptVoice's Terms and Privacy Policy.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
