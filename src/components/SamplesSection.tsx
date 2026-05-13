
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function SamplesSection() {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-headline text-muted-foreground mb-12">Trusted by thousands of users worldwide</h2>
        
        <div className="flex flex-wrap justify-center gap-6">
          {PlaceHolderImages.map((sample) => (
            <div key={sample.id} className="relative w-32 h-32 md:w-48 md:h-48 group">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 group-hover:border-primary transition-all p-1">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={sample.imageUrl}
                    alt={sample.description}
                    fill
                    className="object-cover"
                    data-ai-hint={sample.imageHint}
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold uppercase tracking-widest">{sample.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
