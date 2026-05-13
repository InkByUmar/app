import { ShieldCheck, Scissors, CloudDownload } from 'lucide-react';

const features = [
  {
    icon: Scissors,
    title: 'No More Cropping',
    desc: 'WhatsApp usually forces a crop on non-square photos. We help you fit the entire image into the circular frame.'
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Focused',
    desc: 'Your images are processed securely within your browser. We don\'t store your personal photos on our servers.'
  },
  {
    icon: CloudDownload,
    title: '100% Free & HD',
    desc: 'Download in ultra-high 1080x1080 resolution without any hidden costs or annoying watermarks.'
  }
];

export function WhyUseSection() {
  return (
    <section id="why-use" className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-headline font-bold mb-6 text-[#111B21]">Why Choose <span className="text-primary">WhatsQuality?</span></h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
            The simplest tool for your WhatsApp Profile Picture.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-10 bg-secondary/20 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all group">
              <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-headline font-bold mb-3 text-[#111B21]">{feature.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
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
