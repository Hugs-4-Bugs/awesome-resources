import React, { useState } from 'react';
import { BlogPostRequest, AIModel } from '../types';
import { PenTool, MapPin, Search, List, Settings2, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  onSubmit: (data: BlogPostRequest) => void;
  isLoading: boolean;
}

const BlogPostForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<BlogPostRequest>({
    title: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    location: '',
    length: 'Medium (1000-1500 words)',
    model: AIModel.GEMINI_PRO,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm placeholder:text-slate-400 hover:border-slate-300";
  const labelClasses = "text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block flex items-center gap-1.5";

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Parameters</h3>
        <p className="text-slate-500 text-sm">Define your content strategy.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Title */}
        <div className="group">
          <label htmlFor="title" className={labelClasses}>
            <PenTool className="w-3 h-3" /> Blog Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. 10 Best Coffee Shops in Seattle"
            value={formData.title}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Primary Keyword */}
        <div>
          <label htmlFor="primaryKeyword" className={labelClasses}>
            <Search className="w-3 h-3" /> Primary Keyword
          </label>
          <input
            id="primaryKeyword"
            name="primaryKeyword"
            type="text"
            required
            placeholder="e.g. artisan coffee seattle"
            value={formData.primaryKeyword}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Secondary Keywords */}
        <div>
          <label htmlFor="secondaryKeywords" className={labelClasses}>
            <List className="w-3 h-3" /> Secondary Keywords
          </label>
          <input
            id="secondaryKeywords"
            name="secondaryKeywords"
            type="text"
            placeholder="comma, separated, list"
            value={formData.secondaryKeywords}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
            {/* Location */}
            <div>
            <label htmlFor="location" className={labelClasses}>
                <MapPin className="w-3 h-3" /> Target Location (GEO)
            </label>
            <input
                id="location"
                name="location"
                type="text"
                placeholder="Global / City, State"
                value={formData.location}
                onChange={handleChange}
                className={inputClasses}
            />
            </div>
            
            {/* Length */}
            <div>
            <label htmlFor="length" className={labelClasses}>
                <Settings2 className="w-3 h-3" /> Content Length
            </label>
            <div className="relative">
                <select
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                className={`${inputClasses} appearance-none cursor-pointer`}
                >
                <option value="Short (500-800 words)">Short (500-800 words)</option>
                <option value="Medium (1000-1500 words)">Medium (1000-1500 words)</option>
                <option value="Long (2000+ words)">Long (2000+ words)</option>
                </select>
                <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
            </div>
        </div>

        <div className="pt-4">
            <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 group ${
                isLoading 
                ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30 hover:-translate-y-0.5'
            }`}
            >
            {isLoading ? (
                'Processing...'
            ) : (
                <>
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    Generate Content
                </>
            )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default BlogPostForm;