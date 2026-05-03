
"use client";

import { socialLinks } from '@/lib/data';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function Socials({ limit }: { limit?: number }) {
    const linksToShow = limit ? socialLinks.slice(0, limit) : socialLinks;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2 flex-wrap justify-center">
                {linksToShow.map((link) => (
                    <Tooltip key={link.name} delayDuration={100}>
                        <TooltipTrigger asChild>
                            <Button key={link.name} variant="outline" size="icon" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                                <link.icon className="h-5 w-5" />
                            </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{link.name}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}
