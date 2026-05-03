
"use client";

import { useEffect, useState } from 'react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function Preloader() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500',
        isMounted ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="w-24 h-24">
        <Logo useAnimation={true} />
      </div>
      <p className="mt-4 text-lg text-muted-foreground font-headline animate-pulse">
        Initiating hyperdrive...
      </p>
    </div>
  );
}
