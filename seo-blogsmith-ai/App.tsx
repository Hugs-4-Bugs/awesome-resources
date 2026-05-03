import React, { useState, useRef } from 'react';
import { BlogPostRequest, GenerationStatus } from './types';
import { generateBlogPostStream } from './services/geminiService';
import BlogPostForm from './components/BlogPostForm';
import BlogPostPreview from './components/BlogPostPreview';
import Spinner from './components/Spinner';
import { Sparkles, AlertCircle, Feather } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (request: BlogPostRequest) => {
    setStatus(GenerationStatus.GENERATING);
    setContent('');
    setError(null);
    
    // Smooth scroll to result area on mobile once generation starts
    setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const stream = generateBlogPostStream(request);
      
      for await (const chunk of stream) {
        setContent(prev => prev + chunk);
      }
      
      setStatus(GenerationStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while communicating with the AI.');
      setStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      {/* Elegant Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <Feather className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                SEO Blogsmith
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-1">AI Content Engine</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* Intro Section - Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
            Craft World-Class Content <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Without the Effort.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
            An expert-level AI engine that writes human-quality, ranking-ready blog posts tailored to your specific SEO needs.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Input Form Column */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-8">
                <div className="bg-white rounded-2xl shadow-elegant border border-slate-100 p-1">
                    <BlogPostForm 
                        onSubmit={handleGenerate} 
                        isLoading={status === GenerationStatus.GENERATING} 
                    />
                </div>
            </div>

            {/* Result Area Column */}
            <div className="lg:col-span-7" ref={resultRef}>
                {status === GenerationStatus.IDLE && (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center h-[600px] flex flex-col items-center justify-center text-slate-400">
                        <Sparkles className="w-12 h-12 mb-4 text-slate-300" />
                        <p className="text-lg">Your generated content will appear here.</p>
                        <p className="text-sm">Configure the parameters on the left to begin.</p>
                    </div>
                )}

                {status === GenerationStatus.GENERATING && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-soft p-8 border border-slate-100 flex flex-col items-center justify-center min-h-[200px] animate-pulse">
                            <Spinner />
                            <p className="text-slate-600 font-medium mt-4">Drafting your masterpiece...</p>
                            <p className="text-xs text-slate-400 mt-2">Optimizing for SEO, AEO, and GEO factors</p>
                        </div>
                        {/* Live Preview */}
                        {content && (
                             <div className="opacity-60 grayscale-[30%] pointer-events-none transition-opacity duration-500">
                                 <BlogPostPreview content={content} />
                            </div>
                        )}
                    </div>
                )}

                {status === GenerationStatus.ERROR && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-800 flex flex-col items-center gap-3">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                        <h3 className="font-bold text-xl">Generation Failed</h3>
                        <p className="text-red-600/80">{error}</p>
                        <button 
                            onClick={() => setStatus(GenerationStatus.IDLE)}
                            className="mt-4 px-6 py-2 bg-white border border-red-200 rounded-full hover:bg-red-50 text-sm font-semibold transition-colors shadow-sm text-red-600"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {(status === GenerationStatus.COMPLETED) && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                         <BlogPostPreview content={content} />
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;