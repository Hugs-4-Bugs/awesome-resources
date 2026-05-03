"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { skillCategories } from '@/lib/data';
import { summarizeSkill } from '@/ai/flows/skill-summary';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Skeleton } from '../ui/skeleton';

interface SkillSummary {
  [key: string]: string | null;
}

export function SkillsSection() {
  const [summaries, setSummaries] = useState<SkillSummary>({});
  const [loadingSkill, setLoadingSkill] = useState<string | null>(null);

  const handleSkillHover = async (skillName: string) => {
    if (summaries[skillName]) return; // Already fetched

    setLoadingSkill(skillName);
    try {
      const result = await summarizeSkill({ skill: skillName });
      setSummaries(prev => ({ ...prev, [skillName]: result.summary }));
    } catch (error) {
      console.error(`Failed to summarize skill ${skillName}:`, error);
      setSummaries(prev => ({ ...prev, [skillName]: `An expert in ${skillName}.` })); // Fallback
    } finally {
      setLoadingSkill(null);
    }
  };
  
  return (
    <section id="skills" className="bg-secondary/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Technical Expertise</h2>
          <p className="text-lg text-muted-foreground mt-2 font-body">The tools and technologies we use to build digital experiences.</p>
        </div>

        <Tabs defaultValue={skillCategories[0].name} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mx-auto max-w-4xl h-auto flex-wrap">
            {skillCategories.map((category) => (
              <TabsTrigger key={category.name} value={category.name}>{category.name}</TabsTrigger>
            ))}
          </TabsList>
          
          <TooltipProvider>
            {skillCategories.map((category) => (
              <TabsContent key={category.name} value={category.name}>
                <Card className="glassmorphism mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <category.icon className="h-6 w-6 text-primary" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {category.skills.map((skill) => (
                        <Tooltip key={skill.name} delayDuration={100}>
                          <TooltipTrigger asChild>
                            <div onMouseEnter={() => handleSkillHover(skill.name)}>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-secondary transition-colors cursor-pointer border">
                                <skill.icon className="h-5 w-5 text-accent" />
                                <span className="font-medium font-body">{skill.name}</span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            {loadingSkill === skill.name ? (
                               <Skeleton className="h-4 w-48" />
                            ) : (
                                <p className="max-w-xs font-body">{summaries[skill.name]}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </TooltipProvider>
        </Tabs>
      </div>
    </section>
  );
}
