
"use client";

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Mic, Send, Sparkles, X, Code, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { tradingExplanation } from '@/ai/flows/trading-explanation';
import { projectExplanation } from '@/ai/flows/project-explanation';
import { scheduleMeeting, ScheduleMeetingInput } from '@/ai/flows/schedule-meeting';
import { generalChat } from '@/ai/flows/general-chat';
import { projects, userDetails, experiences, services, tradingConcepts, skillCategories } from '@/lib/data';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audio?: string;
};

type InteractionMode = 'idle' | 'trading' | 'projects' | 'schedule' | 'general';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  topic: z.string().min(5, { message: 'Topic must be at least 5 characters.' }),
  availability: z.string().min(10, { message: 'Please describe your availability.' }),
});

// Hook to persist state in sessionStorage
const useSessionState = <T,>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.sessionStorage.getItem(key);
        return item ? JSON.parse(item) : initialState;
      }
      return initialState;
    } catch (error) {
      console.error(error);
      return initialState;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
};

const websiteContext = `
Prabhat Kumar's Details: ${userDetails}
Projects: ${JSON.stringify(projects.map(p => ({ name: p.name, description: p.description, tags: p.tags })))}
Experiences: ${JSON.stringify(experiences)}
Services: ${JSON.stringify(services)}
Skills: ${JSON.stringify(skillCategories)}
Trading Concepts: ${JSON.stringify(tradingConcepts)}
`;

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useSessionState<Message[]>('aiChatMessages', []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useSessionState<InteractionMode>('aiChatMode', 'idle');
  const [projectSelection, setProjectSelection] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', topic: '', availability: '' },
  });

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast({ title: 'Voice Error', description: `Speech recognition error: ${event.error}`, variant: 'destructive'});
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);
  
  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if(!recognitionRef.current) {
        toast({ title: 'Unsupported', description: 'Voice input is not supported in your browser.', variant: 'destructive' });
        return;
      }
      recognitionRef.current?.start();
    }
    setIsListening(prev => !prev);
  };

  const addMessage = (role: Message['role'], content: string, audio?: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, audio }]);
  };

  const handleModeSelection = (newMode: InteractionMode) => {
    setMode(newMode);
    setInput('');
    if (newMode === 'general') {
      addMessage('system', 'You can ask me anything about Prabhat Kumar, his skills, projects, or experience.');
    } else if (newMode === 'trading') {
      addMessage('system', 'You can ask me to explain a trading concept (e.g., "What are Order Blocks?").');
    } else if (newMode === 'projects') {
      addMessage('system', 'Please select a project from the dropdown to get an AI-powered explanation.');
    } else if (newMode === 'schedule') {
        addMessage('system', 'Please fill out the form below to schedule a meeting with me.');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input && mode !== 'projects' && mode !== 'schedule') return;

    let userMessage = input;
    if (mode === 'projects') {
        const selectedProject = projects.find(p => p.name === projectSelection);
        if (!selectedProject) {
            addMessage('system', 'Please select a project first.');
            return;
        }
        userMessage = `Explain the project: ${selectedProject.name}`;
    }

    addMessage('user', userMessage);
    setInput('');
    setIsLoading(true);

    try {
      if (mode === 'general') {
        const res = await generalChat({ query: input, context: websiteContext });
        addMessage('assistant', res.answer);
      } else if (mode === 'trading') {
        const res = await tradingExplanation({ concept: input });
        addMessage('assistant', res.explanation, res.audio);
      } else if (mode === 'projects') {
        const selectedProject = projects.find(p => p.name === projectSelection);
        const res = await projectExplanation({ projectName: selectedProject!.name, projectDescription: selectedProject!.description });
        addMessage('assistant', res.explanation);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSubmit = async (values: ScheduleMeetingInput) => {
    addMessage('user', `Meeting Request: ${values.topic}`);
    setIsLoading(true);
    try {
      const result = await scheduleMeeting(values);
      addMessage('assistant', result.confirmation);
      form.reset();
      setMode('idle'); // Or some confirmation state
    } catch (error) {
      console.error('Failed to schedule meeting via AI chat:', error);
      addMessage('assistant', 'Sorry, I couldn\'t schedule the meeting. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (audioDataUri: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioDataUri;
      audioRef.current.play();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setMode('idle');
    setInput('');
    setProjectSelection('');
    form.reset();
  }
  
  const getPlaceholder = () => {
    switch(mode) {
        case 'general': return 'Ask me about Prabhat...';
        case 'trading': return 'Ask about a trading concept...';
        default: return 'Type your message...';
    }
  }

  return (
    <>
    <audio ref={audioRef} />
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {!isOpen && (
          <SheetTrigger asChild>
            <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg" size="icon">
              <Bot className="h-8 w-8" />
            </Button>
          </SheetTrigger>
      )}
      <SheetContent className="w-full sm:w-[500px] sm:max-w-none flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> AI Assistant
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4" viewportRef={scrollViewportRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                 <div className={cn(
                    "rounded-lg p-3 max-w-sm text-sm", 
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary',
                    msg.role === 'system' && 'w-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-center italic'
                  )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.audio && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => handlePlayAudio(msg.audio!)}>
                      Play Audio
                    </Button>
                  )}
                 </div>
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border"><AvatarFallback><Bot /></AvatarFallback></Avatar>
                <div className="rounded-lg p-3 max-w-sm text-sm bg-secondary flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin"/>
                </div>
              </div>
            )}
            {messages.length === 0 && mode === 'idle' && (
                <div className="text-center p-4">
                    <p className="text-muted-foreground mb-4">What would you like to discuss?</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Button variant="outline" onClick={() => handleModeSelection('general')}><MessageSquare className="mr-2 h-4 w-4"/>General Chat</Button>
                        <Button variant="outline" onClick={() => handleModeSelection('trading')}><TrendingUp className="mr-2 h-4 w-4"/>Trading</Button>
                        <Button variant="outline" onClick={() => handleModeSelection('projects')}><Code className="mr-2 h-4 w-4"/>Projects</Button>
                        <Button variant="outline" onClick={() => handleModeSelection('schedule')}><Calendar className="mr-2 h-4 w-4"/>Schedule Meeting</Button>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        {mode !== 'idle' ? (
          <div className="p-4 border-t bg-background">
            {mode === 'schedule' ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleScheduleSubmit)} className="space-y-3">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                   <FormField control={form.control} name="topic" render={({ field }) => (
                      <FormItem><FormLabel>Topic</FormLabel><FormControl><Input placeholder="Project collaboration..." {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                   <FormField control={form.control} name="availability" render={({ field }) => (
                      <FormItem><FormLabel>Availability</FormLabel><FormControl><Textarea placeholder="Weekdays after 5 PM IST..." {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Request
                  </Button>
                </form>
              </Form>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                {mode === 'projects' ? (
                  <Select value={projectSelection} onValueChange={setProjectSelection}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select a project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={input} onChange={e => setInput(e.target.value)} placeholder={getPlaceholder()} className="flex-1" disabled={isLoading} />
                )}
                {(mode === 'trading' || mode === 'general') && (
                  <Button size="icon" variant="ghost" type="button" onClick={handleVoiceInput} disabled={isLoading} className={cn(isListening && 'text-red-500')}>
                      <Mic className="h-5 w-5" />
                  </Button>
                )}
                <Button type="submit" size="icon" disabled={isLoading || (mode === 'projects' && !projectSelection)}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            )}
            <Button variant="link" size="sm" className="w-full mt-2 text-muted-foreground" onClick={resetChat}>Start Over</Button>
          </div>
        ) : (messages.length > 0 && 
            <div className="p-4 border-t bg-background text-center">
                <Button variant="outline" onClick={resetChat}>Start Over</Button>
            </div>
        )}
      </SheetContent>
    </Sheet>
    </>
  );
}
