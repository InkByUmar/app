
import { Header } from '@/components/Header';
import { WhatsCropWorkspace } from '@/components/WhatsCropWorkspace';
import { HowToSection } from '@/components/HowToSection';
import { WhyUseSection } from '@/components/WhyUseSection';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { SamplesSection } from '@/components/SamplesSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow">
        <section id="hero" className="pt-24 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight leading-tight">
              WhatsApp Full <span className="text-primary">DP Maker</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
              Resize and enhance your photos to full size profile pictures without forced cropping. 100% free and HD quality.
            </p>
          </div>
          
          <WhatsCropWorkspace />
        </section>

        <SamplesSection />
        <HowToSection />
        <WhyUseSection />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
