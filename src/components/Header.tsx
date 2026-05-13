import { Camera } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-xl shadow-sm">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight text-[#111B21]">
            Whats<span className="text-primary">Quality</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-to" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it works</a>
          <a href="#why-use" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <a 
            href="#hero" 
            className="bg-primary text-white hover:bg-[#128C7E] px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-md shadow-primary/20"
          >
            Start Creating
          </a>
        </div>
      </div>
    </header>
  );
}
