
import { Upload, Sliders, Sparkles, Download } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Photo',
    desc: 'Select any high-resolution photo from your device gallery.'
  },
  {
    icon: Sliders,
    title: 'Pick a Style',
    desc: 'Choose between Blur Background, Solid Color, or Auto-Fit.'
  },
  {
    icon: Sparkles,
    title: 'AI Enhancement',
    desc: 'Optional: Use our AI tools to enhance clarity and generate backgrounds.'
  },
  {
    icon: Download,
    title: 'Export in HD',
    desc: 'Download your ready-to-use 1080x1080 profile picture instantly.'
  }
];

export function HowToSection() {
  return (
    <section id="how-to" className="py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-headline font-bold text-center mb-16">
          How to Create a <span className="text-primary">Full DP</span>
        </h2>
        
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative p-6 bg-card rounded-2xl border border-border/50 text-center">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-background flex items-center justify-center rounded-full font-bold">
                {i + 1}
              </div>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-headline font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
