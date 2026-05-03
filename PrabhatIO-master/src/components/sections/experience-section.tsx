import { experiences } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function ExperienceSection() {
  return (
    <section id="experience" className="bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Journey</h2>
          <p className="text-lg text-muted-foreground mt-2 font-body">The professional journey of our founder.</p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
          {experiences.map((exp, index) => (
            <div key={index} className="relative mb-8">
              <div className="flex items-center" style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
                <div className="w-1/2 px-4">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle>{exp.role}</CardTitle>
                      <CardDescription>{exp.company} &middot; {exp.period}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground font-body">{exp.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-2 rounded-full border-2 border-primary">
                    <exp.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
