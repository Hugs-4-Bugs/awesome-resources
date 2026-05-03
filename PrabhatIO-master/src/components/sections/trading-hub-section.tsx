"use client";

import { useState, useRef, useEffect } from 'react';
import { tradingConcepts } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AudioWaveform, Loader2, Pause, Play } from 'lucide-react';
import { tradingExplanation } from '@/ai/flows/trading-explanation';
import { cn } from '@/lib/utils';

export function TradingHubSection() {
  const [loadingConcept, setLoadingConcept] = useState<string | null>(null);
  const [playingConcept, setPlayingConcept] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayExplanation = async (conceptName: string) => {
    if (loadingConcept) return;

    if (playingConcept === conceptName && audioRef.current) {
      audioRef.current.pause();
      setPlayingConcept(null);
      return;
    }
    
    // Pause any currently playing audio
    if (audioRef.current) {
        audioRef.current.pause();
    }

    setLoadingConcept(conceptName);
    try {
      const result = await tradingExplanation({ concept: conceptName });
      
      const newAudio = new Audio(result.audio);
      audioRef.current = newAudio;
      
      newAudio.play();
      setPlayingConcept(conceptName);

      newAudio.onended = () => {
        setPlayingConcept(null);
      };

    } catch (error) {
      console.error('Failed to get trading explanation:', error);
      setPlayingConcept(null);
    } finally {
      setLoadingConcept(null);
    }
  };
  
  return (
    <section id="trading-hub" className="bg-background">
        <div className="container">
            <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Trading Knowledge Hub</h2>
            <p className="text-lg text-muted-foreground mt-2 font-body">Core concepts I use in my trading strategies. Press play for an AI-powered audio explanation.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tradingConcepts.map((concept, index) => (
                    <Card key={index} className={cn("glassmorphism flex flex-col transition-all", playingConcept === concept.name && "shadow-lg shadow-primary/20 ring-2 ring-primary/50")}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <concept.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>{concept.name}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col">
                            <CardDescription className="flex-grow">{concept.description}</CardDescription>
                            <Button 
                                className="mt-4 w-full" 
                                variant="outline"
                                onClick={() => handlePlayExplanation(concept.name)}
                                disabled={!!loadingConcept && loadingConcept !== concept.name}
                            >
                                {loadingConcept === concept.name ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    playingConcept === concept.name ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />
                                )}
                                {playingConcept === concept.name ? 'Pause' : (loadingConcept === concept.name ? 'Loading...' : 'Explain with AI Voice')}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </section>
  );
}
