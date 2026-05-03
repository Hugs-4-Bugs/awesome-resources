import { services } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function ServicesSection() {
  return (
    <section id="services" className="bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">What We Do</h2>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto font-body">We deliver cutting-edge solutions tailored to your business needs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="text-center glassmorphism h-full flex flex-col transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-2">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4 ring-8 ring-primary/5">
                  <service.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-headline">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground font-body">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
