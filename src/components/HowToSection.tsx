import { Upload, Sliders, Download } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Photo',
    desc: 'Select any high-resolution photo from your device gallery.'
  },
  {
    icon: Sliders,
    title: 'Pick a Style',
    desc: 'Choose between Blur Background, Solid Color, or Auto-Fit to frame your photo.'
  },
  {
    icon: Download,
    title: 'Export in HD',
    desc: 'Download your ready-to-use 1080x1080 profile picture instantly.'
  }
];

export function HowToSection() {
  return (
    <section id="how-to" className="py-24 px-4 bg-secondary/10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-headline font-bold text-center mb-16 text-[#111B21]">
          Simple <span className="text-primary">3-Step</span> Process
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative p-8 bg-white rounded-3xl shadow-xl shadow-black/[0.03] border border-border/40 text-center hover:scale-105 transition-transform">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white flex items-center justify-center rounded-2xl font-bold shadow-lg shadow-primary/20 text-xl">
                {i + 1}
              </div>
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4 text-[#111B21]">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
