"use client";

import { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { projects } from '@/lib/data';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { projectExplanation } from '@/ai/flows/project-explanation';
import { Skeleton } from '../ui/skeleton';
import { Bot, Code, Link as LinkIcon, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

function ProjectExplanation({ projectName, projectDescription }: { projectName: string; projectDescription: string; }) {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExplanation = async () => {
    setIsLoading(true);
    setExplanation('');
    try {
      const result = await projectExplanation({ projectName, projectDescription });
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Failed to explain project:', error);
      setExplanation('Could not load explanation at this time. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => { if(open && !explanation) { handleExplanation(); }}}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Bot className="mr-2 h-4 w-4" /> Explain This Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">AI Explanation: {projectName}</DialogTitle>
          <DialogDescription className="font-body">
            An AI-generated overview of the project's technology and challenges.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[120px]">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
               <p className="text-sm text-muted-foreground whitespace-pre-wrap font-code">{explanation}</p>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({ project, index }: { project: typeof projects[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    const rotateY = (x / (width / 2)) * 10;
    const rotateX = (-y / (height / 2)) * 10;
    cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
    cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--rotate-x', '0deg');
    cardRef.current.style.setProperty('--rotate-y', '0deg');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="p-1 perspective-card"
    >
      <Card className="h-full overflow-hidden group transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-primary/10 glassmorphism">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative h-52 overflow-hidden">
            <Image
              src={project.image}
              alt={project.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              data-ai-hint={project.imageAiHint}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </div>

          <div className="p-6 flex flex-col flex-grow bg-card/0 font-body">
            <h3 className="text-xl font-headline font-bold">{project.name}</h3>
            <p className="text-muted-foreground mt-2 flex-grow text-sm leading-relaxed">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 my-4">
                {project.tags.map(tag => <Badge key={tag} variant="secondary" className="font-code">{tag}</Badge>)}
            </div>

            <div className="flex flex-wrap gap-2 items-center mt-auto pt-4 border-t border-border/50">
                <Button asChild size="sm">
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                    <Code className="mr-2 h-4 w-4" /> View Code
                    </a>
                </Button>
               <ProjectExplanation projectName={project.name} projectDescription={project.description} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" className="bg-secondary/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter">Our Work</h2>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto font-body">A selection of our projects. Hover for a subtle 3D effect.</p>
        </div>
        
        <Carousel 
          opts={{ align: "start", loop: true }} 
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent>
            {projects.map((project, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <ProjectCard project={project} index={index} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
