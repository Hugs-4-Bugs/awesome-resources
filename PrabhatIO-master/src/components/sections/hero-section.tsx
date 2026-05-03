
"use client";

import { useState, useEffect, useRef, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const titles = ["Software Engineer.", "AI Enthusiast.", "Founder.", "Innovator."];

export function HeroSection() {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleTyping = () => {
      const currentTitle = titles[currentTitleIndex];
      if (isDeleting) {
        setDisplayedTitle(currentTitle.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
        }
      } else {
        setDisplayedTitle(currentTitle.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        if (charIndex + 1 === currentTitle.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      }
    };

    const typingTimeout = setTimeout(handleTyping, isDeleting ? 75 : 120);
    return () => clearTimeout(typingTimeout);
  }, [charIndex, isDeleting, currentTitleIndex]);
  
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    const rotateY = (x / (width / 2)) * 15; // Increased rotation for more effect
    const rotateX = (-y / (height / 2)) * 15;
    imageRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
    imageRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
    imageRef.current.style.transform = `perspective(1200px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    if (!imageRef.current) return;
    imageRef.current.style.setProperty('--rotate-x', '0deg');
    imageRef.current.style.setProperty('--rotate-y', '0deg');
    imageRef.current.style.transform = `perspective(1200px) rotateY(0) rotateX(0) scale3d(1, 1, 1)`;
  };


  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      <div className="container grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)] py-20 relative z-10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-headline font-extrabold tracking-tighter">
            <a href="https://quantumfusion-solutions.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-gradient transition-colors duration-300">
              Prabhat Kumar
            </a>
            <span className="block text-gradient mt-2 min-h-[4rem] md:min-h-[5rem] lg:min-h-[7rem]">
              {displayedTitle}
              <span className="opacity-50">|</span>
            </span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl font-body">
            Merging Intelligence with Innovation.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
            <Button size="lg" asChild>
              <Link href="#projects">
                View My Work <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
        <div 
          ref={imageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto animate-fade-in [animation-delay:200ms] transition-transform duration-300 ease-out"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute -inset-8 bg-gradient-to-r from-primary to-accent rounded-full animate-hero-glow"></div>
          <Image
            src="/images/prabhat.jpg"
            alt="Prabhat Kumar"
            width={600}
            height={600}
            priority
            className="rounded-full object-contain z-10 relative shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
