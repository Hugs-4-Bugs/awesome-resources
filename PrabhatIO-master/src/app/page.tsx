import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { AboutSection } from '@/components/sections/about-section';
import { ContactSection } from '@/components/sections/contact-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { HeroSection } from '@/components/sections/hero-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { ServicesSection } from '@/components/sections/services-section';
import { SkillsSection } from '@/components/sections/skills-section';
import { TradingHubSection } from '@/components/sections/trading-hub-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Header />
      <div className="flex-1">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <ServicesSection />
        <TradingHubSection />
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
