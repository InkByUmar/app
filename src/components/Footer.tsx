
import { Camera, Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary p-1.5 rounded-xl">
            <Camera className="w-5 h-5 text-background" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">
            Whats<span className="text-primary">Crop</span>
          </span>
        </div>

        <nav className="flex flex-wrap justify-center gap-8 mb-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
          <a href="#" className="hover:text-primary transition-colors">About</a>
        </nav>

        <div className="flex gap-6 mb-8">
          <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-all">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-all">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-all">
            <Github className="w-5 h-5" />
          </a>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} WhatsCrop. All rights reserved. <br className="md:hidden" />
          Made for the WhatsApp community with 💚
        </p>
      </div>
    </footer>
  );
}
