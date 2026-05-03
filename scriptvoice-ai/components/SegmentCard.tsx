import React from 'react';
import { ScriptSegment } from '../types';
import { PlayIcon, PauseIcon, RefreshIcon, SparklesIcon, LoaderIcon } from './Icons';

interface SegmentCardProps {
  segment: ScriptSegment;
  onUpdateText: (id: string, text: string) => void;
  onGenerate: (id: string) => void;
  onPlay: (id: string) => void;
  onPause: (id: string) => void;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ 
  segment, 
  onUpdateText, 
  onGenerate, 
  onPlay, 
  onPause
}) => {
  return (
    <div className="group relative pl-4 border-l-2 border-gray-100 hover:border-gray-200 transition-colors py-4">
        <div className="flex gap-4 items-start">
            {/* Timestamp Badge */}
            <div className="flex-shrink-0 w-24 pt-2">
                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {segment.timestamp}
                </span>
                {/* Visual Description tooltip hint */}
                <div className="mt-2 text-[10px] text-gray-400 leading-tight">
                    <span className="font-semibold text-gray-500 uppercase">Visual:</span>
                    <br/>
                    {segment.visualDescription}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-grow">
                <textarea
                    className="w-full bg-transparent border-0 p-0 text-gray-800 text-lg leading-relaxed focus:ring-0 focus:outline-none resize-none font-medium placeholder-gray-300"
                    rows={Math.max(2, segment.voText.split('\n').length)}
                    value={segment.voText}
                    onChange={(e) => onUpdateText(segment.id, e.target.value)}
                    placeholder="Enter voiceover text here..."
                    style={{ minHeight: '60px' }}
                />
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {segment.audioBuffer ? (
                    <div className="flex items-center gap-2">
                         <button
                            onClick={() => segment.isPlaying ? onPause(segment.id) : onPlay(segment.id)}
                            className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm"
                            title="Play"
                        >
                            {segment.isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => onGenerate(segment.id)}
                            disabled={segment.isGenerating}
                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            title="Regenerate"
                        >
                            {segment.isGenerating ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <RefreshIcon className="w-4 h-4" />}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onGenerate(segment.id)}
                        disabled={segment.isGenerating}
                        className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-black transition-colors flex items-center gap-1.5"
                    >
                        {segment.isGenerating ? (
                            <LoaderIcon className="w-3 h-3 animate-spin" />
                        ) : (
                            <SparklesIcon className="w-3 h-3" />
                        )}
                        Generate
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default SegmentCard;
