import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How can I set a full size WhatsApp DP without cropping?",
    a: "WhatsQuality allows you to upload any portrait or landscape photo and automatically fits it into a 1:1 square ratio by adding a blurred or solid color background. This prevents WhatsApp from forcing you to crop your image."
  },
  {
    q: "Is WhatsQuality the best WhatsApp DP maker?",
    a: "Yes! WhatsQuality offers 1080x1080 HD export, complete privacy, no watermarks, and a completely free experience, making it the top choice for users globally."
  },
  {
    q: "Will my HD WhatsApp DP look blurry after using this tool?",
    a: "Not at all. We export all profile pictures in high-definition 1080x1080px resolution, ensuring your photo looks sharp and clear on all smartphone screens."
  },
  {
    q: "Is it safe to use this WhatsApp profile picture maker?",
    a: "Absolutely. Unlike other apps, WhatsQuality processes your images locally in your browser. Your photos are never uploaded to any server, ensuring 100% privacy."
  },
  {
    q: "What is the recommended size for a WhatsApp DP?",
    a: "WhatsApp uses a 1:1 square ratio. For the best result on modern high-res displays, we recommend 1080x1080 pixels, which is exactly what our tool provides."
  },
  {
    q: "Does WhatsQuality add watermarks to my photos?",
    a: "No. WhatsQuality is 100% free and we never add watermarks to your downloaded images. You get a clean, professional profile picture every time."
  },
  {
    q: "Can I use this for other social media platforms like Instagram?",
    a: "Yes! The 1080x1080 square format we provide is perfect for Instagram profile pictures, Telegram, Facebook, and many other social platforms."
  },
  {
    q: "How much does it cost to use WhatsQuality?",
    a: "WhatsQuality is completely free to use. We don't have any hidden fees, subscriptions, or 'premium' features. Everything is accessible for everyone."
  },
  {
    q: "Can I adjust the background color of my WhatsApp DP?",
    a: "Yes, you can choose between a blurred version of your original photo or select any solid color from our palette (or a custom hex code) to match your style."
  },
  {
    q: "How do I download the final HD WhatsApp DP?",
    a: "Once you are happy with the preview (either Square or Circle view), simply click the 'Download HD DP' button, and your high-quality image will be saved to your device instantly."
  }
];

export function FaqSection() {
  return (
    <section id="faq" className="py-24 px-4 bg-secondary/10">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-headline font-bold text-center mb-16 text-[#111B21]">Common <span className="text-primary">Questions</span></h2>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-none bg-white rounded-3xl px-8 shadow-sm">
              <AccordionTrigger className="hover:no-underline font-headline font-bold text-xl py-6 text-[#111B21] text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-8 text-lg leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
