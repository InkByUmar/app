import { Upload, Sliders, Download, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Photo',
    desc: 'Choose any high-resolution image from your device. Our WhatsApp DP Maker supports JPG, PNG, and WebP formats.'
  },
  {
    icon: Sliders,
    title: 'Customize Your Style',
    desc: 'Select "Blur Background" for a modern look or "Solid Color" for a clean aesthetic. Fit your photo exactly how you want it.'
  },
  {
    icon: CheckCircle,
    title: 'Preview the Result',
    desc: 'Switch to the "Circle View" to see exactly how your new HD WhatsApp DP will look on your profile.'
  },
  {
    icon: Download,
    title: 'Download HD DP',
    desc: 'Click download to save your 1080x1080px profile picture. It is ready to be set as your WhatsApp DP without cropping.'
  }
];

export function HowToSection() {
  return (
    <section id="how-to" className="py-24 px-4 bg-secondary/10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-headline font-bold text-center mb-16 text-[#111B21]">
          How to Create a <span className="text-primary">Full Size DP</span>
        </h2>
        
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative p-8 bg-white rounded-3xl shadow-xl shadow-black/[0.03] border border-border/40 text-center hover:scale-105 transition-transform group">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white flex items-center justify-center rounded-2xl font-bold shadow-lg shadow-primary/20 text-xl group-hover:scale-110 transition-transform">
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
