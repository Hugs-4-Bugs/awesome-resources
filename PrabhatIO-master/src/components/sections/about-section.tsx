
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userDetails, education, bookData, bookChapters } from '@/lib/data';
import { generateAboutMe } from '@/ai/flows/dynamic-about-me';
import { summarizeBook } from '@/ai/flows/book-summary';
import { Book, GraduationCap, Loader2, Sparkles, User, BookOpenCheck } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { summarizeChapter } from '@/ai/flows/chapter-summary';

function ChapterSummaryAccordion() {
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const handleGenerateSummary = async (chapterTitle: string, chapterContent: string) => {
    if (summaries[chapterTitle]) return; // Already loaded

    setLoading(chapterTitle);
    try {
      const result = await summarizeChapter({ chapterTitle, chapterContent });
      setSummaries(prev => ({ ...prev, [chapterTitle]: result.summary }));
    } catch (error) {
      console.error('Failed to generate chapter summary:', error);
      setSummaries(prev => ({ ...prev, [chapterTitle]: 'Could not load summary. Please try again.' }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Learn More</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <BookOpenCheck className="text-primary"/> The Inner Battle: Chapter Summaries
          </DialogTitle>
          <DialogDescription className="font-body">
            An interactive, AI-powered summary for each chapter. Click a chapter to learn more.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4 mt-4">
          <Accordion type="single" collapsible className="w-full">
            {bookChapters.map((chapter) => (
              <AccordionItem key={chapter.title} value={chapter.title}>
                <AccordionTrigger onOpening={() => handleGenerateSummary(chapter.title, chapter.content)}>
                  {chapter.title}
                </AccordionTrigger>
                <AccordionContent>
                  {loading === chapter.title ? (
                     <div className="space-y-2 py-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap font-body leading-relaxed">
                      {summaries[chapter.title]}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


export function AboutSection() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTone, setCurrentTone] = useState<'professional' | 'casual'>('professional');

  const qfsLink = "https://quantumfusion-solutions.vercel.app/";
  const linkedUserDetails = userDetails.replace(
      /QuantumFusion Solutions/g,
      `<a href="${qfsLink}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">QuantumFusion Solutions</a>`
  );

  useEffect(() => {
    async function fetchSummary() {
      setIsLoading(true);
      try {
        const result = await generateAboutMe({ 
          length: isExpanded ? 'long' : 'short', 
          tone: currentTone, 
          userDetails 
        });
        const linkedSummary = result.summary.replace(
          /QuantumFusion Solutions/g,
          `<a href="${qfsLink}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">QuantumFusion Solutions</a>`
        );
        setSummary(linkedSummary);
      } catch (error) {
        console.error('Failed to generate about me summary:', error);
        setSummary(isExpanded ? linkedUserDetails : linkedUserDetails.substring(0, 200) + '...');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, [isExpanded, currentTone, linkedUserDetails]);

  const toggleExpansion = () => setIsExpanded(!isExpanded);
  
  const toggleTone = () => setCurrentTone(prev => prev === 'professional' ? 'casual' : 'professional');

  return (
    <section id="about" className="bg-secondary/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter">About Our Agency</h2>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto font-body">A glimpse into our journey, passions, and professional background.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-3">
            <Card className="glassmorphism">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <CardTitle className="flex items-center gap-3 font-headline"><User className="text-primary"/> Our Story</CardTitle>
                   <div className="flex items-center gap-2">
                     <Button size="sm" variant="outline" onClick={toggleTone} disabled={isLoading}>
                       <Sparkles className="mr-2 h-4 w-4" />
                       {currentTone === 'professional' ? 'Make it Casual' : 'Make it Pro'}
                     </Button>
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed font-body" dangerouslySetInnerHTML={{ __html: summary }} />
                )}
                <Button variant="link" onClick={toggleExpansion} className="px-0 mt-2 text-primary">
                  {isExpanded ? 'Show Less' : 'Read More...'}
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-8 glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline"><GraduationCap  className="text-primary" /> Founder's Education</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-6 font-body">
                  {education.map((edu, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-full mt-1">
                        <edu.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{edu.institution}</h3>
                        <p className="text-sm text-muted-foreground">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.period}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
             <Card className="glassmorphism sticky top-24">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline"><Book className="text-primary"/> Founder's Publication</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <Image 
                        src="/images/innerbattle.jpeg"
                        alt="The Inner Battle Book Cover"
                        width={400}
                        height={600}
                        className="rounded-lg shadow-lg mx-auto mb-4 w-2/3"
                        data-ai-hint="book cover"
                    />
                    <p className="text-muted-foreground text-sm mb-4 font-body">A book about personal growth, resilience, and navigating life's challenges.</p>
                    <ChapterSummaryAccordion />
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
