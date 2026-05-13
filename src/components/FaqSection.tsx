import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is WhatsQuality really free?",
    a: "Yes, WhatsQuality is 100% free to use. There are no subscriptions, hidden fees, or watermarks on your downloaded images."
  },
  {
    q: "What is the recommended size for a WhatsApp DP?",
    a: "WhatsApp uses a 1:1 aspect ratio (square) for profile pictures. We export all images at 1080x1080 pixels, which is perfect for high-definition displays."
  },
  {
    q: "Will I lose image quality?",
    a: "No! We process your images with high-quality canvas rendering to ensure your 1080x1080 export looks sharp on all displays."
  },
  {
    q: "How does the 'No Crop' feature work?",
    a: "Instead of cutting out parts of your photo to make it square, we fill the empty space with a blurred version of the same photo or a solid color, allowing the entire original image to fit inside the profile frame."
  },
  {
    q: "Can I use this for Instagram or Telegram?",
    a: "Absolutely! While we focus on WhatsApp, the 1080x1080 square format works perfectly for Instagram Profile Pictures, Telegram, and most other social platforms."
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
              <AccordionTrigger className="hover:no-underline font-headline font-bold text-xl py-6 text-[#111B21]">{faq.q}</AccordionTrigger>
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
