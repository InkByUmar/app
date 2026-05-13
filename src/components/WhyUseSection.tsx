
import { ShieldCheck, Zap, Scissors, CloudDownload } from 'lucide-react';

const features = [
  {
    icon: Scissors,
    title: 'No More Cropping',
    desc: 'WhatsApp usually forces a crop on non-square photos. We help you fit the entire image into the circular frame.'
  },
  {
    icon: Zap,
    title: 'AI-Powered Filling',
    desc: 'Our intelligent AI can extend your photo and generate a beautiful blurred background to keep the focus on your subject.'
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Focused',
    desc: 'Your images are processed securely. We don\'t store your personal photos on our servers beyond the editing session.'
  },
  {
    icon: CloudDownload,
    title: '100% Free & HD',
    desc: 'Download in ultra-high 1080x1080 resolution without any hidden costs or annoying watermarks.'
  }
];

export function WhyUseSection() {
  return (
    <section id="why-use" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-headline font-bold mb-6">Why Use <span className="text-primary">WhatsCrop?</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The smartest way to set your WhatsApp Profile Picture without losing any part of your favorite shots.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="flex gap-6 p-8 bg-secondary/20 rounded-3xl border border-border/50 hover:bg-secondary/40 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
