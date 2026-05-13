import { Header } from '@/components/Header';
import { WhatsCropWorkspace } from '@/components/WhatsCropWorkspace';
import { HowToSection } from '@/components/HowToSection';
import { WhyUseSection } from '@/components/WhyUseSection';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { NativeAd } from '@/components/NativeAd';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow">
        <section id="hero" className="pt-24 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight leading-tight text-[#111B21]">
              WhatsApp Full <span className="text-primary">DP Maker</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
              Resize and enhance your photos to a <strong>Full Size WhatsApp DP</strong> without forced cropping. The ultimate tool for an <strong>HD WhatsApp Profile Picture</strong>.
            </p>
          </div>
          
          <WhatsCropWorkspace />
        </section>

        <HowToSection />
        
        <WhyUseSection />
        
        {/* Informative Content Section for SEO */}
        <section className="py-20 px-4 bg-white border-t border-b">
          <div className="max-w-4xl mx-auto prose prose-green prose-lg">
            <h2 className="text-3xl font-headline font-bold text-[#111B21] mb-6">How to Make a Full Size WhatsApp DP Without Cropping?</h2>
            <p className="text-muted-foreground mb-4">
              Have you ever tried to set a beautiful portrait or landscape photo as your WhatsApp profile picture, only to find that WhatsApp forces you to crop it into a square? It can be frustrating to lose half of your favorite memories just to fit a profile frame. That's where <strong className="font-bold text-primary">WhatsQuality</strong> comes in.
            </p>
            <p className="text-muted-foreground mb-4">
              Our <strong className="font-bold text-[#111B21]">WhatsApp DP Maker</strong> uses advanced canvas processing to intelligently fit your entire photo into the circular frame. By adding a stylish blurred background or a solid color, we ensure that your original image remains 100% intact and visible. This is the most effective way to get a <a href="#how-to" className="text-primary hover:underline">WhatsApp DP without cropping</a>.
            </p>
            <h3 className="text-2xl font-headline font-bold text-[#111B21] mt-8 mb-4">Why is WhatsQuality the Best WhatsApp DP Maker?</h3>
            <p className="text-muted-foreground mb-4">
              When searching for a <strong>WhatsApp profile picture maker</strong>, quality and privacy should be your top priorities. WhatsQuality stands out because it doesn't just resize; it enhances your overall presentation.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="font-bold text-[#111B21]">HD Quality:</strong> We export all images at 1080x1080 pixels, which is the gold standard for an <strong className="font-bold text-[#111B21]">HD WhatsApp DP</strong>.</li>
              <li><strong className="font-bold text-[#111B21]">Privacy First:</strong> Your photos are processed directly in your browser. We never upload your personal images to our servers.</li>
              <li><strong className="font-bold text-[#111B21]">No Watermarks:</strong> We believe in keeping your profile clean. Our tool is completely free with no hidden watermarks.</li>
              <li><strong className="font-bold text-[#111B21]">Easy Customization:</strong> Adjust the blur intensity or choose a color that matches your photo's aesthetic perfectly.</li>
            </ul>
            <p className="text-muted-foreground mt-6 italic">
              Whether you need an <strong>HD WhatsApp DP</strong> for personal use or a professional business profile, our tool ensures you never have to compromise on your image's integrity.
            </p>
          </div>
        </section>

        <FaqSection />
        
        <NativeAd className="bg-secondary/10 py-4" />
      </main>

      <Footer />
    </div>
  );
}
