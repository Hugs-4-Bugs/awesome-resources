
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { socialLinks } from '@/lib/data';
import { Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { scheduleMeeting } from '@/ai/flows/schedule-meeting';
import { useToast } from '@/hooks/use-toast';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  topic: z.string().min(5, { message: 'Topic must be at least 5 characters.' }),
  availability: z.string().min(10, { message: 'Please describe your availability.' }),
});

export function ContactSection() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      topic: '',
      availability: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    try {
      const result = await scheduleMeeting(values);
      toast({
        title: "Meeting Request Sent!",
        description: result.confirmation,
      });
      form.reset();
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="contact" className="bg-secondary/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Get In Touch</h2>
          <p className="text-lg text-muted-foreground mt-2">Let's build something amazing together. Schedule a meeting with our AI.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
                <Card className="glassmorphism h-full">
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Mail className="h-5 w-5 text-primary"/>
                            <a href="mailto:contact@quantumfusions.com" className="text-muted-foreground hover:text-primary">contact@quantumfusions.com</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <MapPin className="h-5 w-5 text-primary"/>
                            <span className="text-muted-foreground">Bengaluru, India</span>
                        </div>
                        <div className="pt-4">
                            <h4 className="font-semibold mb-2">Follow Us</h4>
                            <div className="flex items-center gap-2">
                                {socialLinks.slice(0, 5).map((link) => (
                                    <Button key={link.name} variant="outline" size="icon" asChild>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                                        <link.icon className="h-5 w-5" />
                                    </a>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-3">
            <Card className="glassmorphism">
            <CardHeader>
                <CardTitle>Schedule a Meeting</CardTitle>
            </CardHeader>
            <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Prabhat Kumar" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input placeholder="prabhat@quantumfusions.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl><Input placeholder="Project collaboration, consultation, etc." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Availability</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Weekdays after 5 PM IST, weekends anytime." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> Send Request</>
                  )}
                </Button>
              </form>
            </Form>
            </CardContent>
            </Card>
            </div>
        </div>
      </div>
    </section>
  );
}
