import { Camera, Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t py-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-primary p-2 rounded-xl shadow-md shadow-primary/20">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-headline font-bold tracking-tight text-[#111B21]">
            Whats<span className="text-primary">Crop</span>
          </span>
        </div>

        <nav className="flex flex-wrap justify-center gap-10 mb-10 text-base font-semibold text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
          <a href="#" className="hover:text-primary transition-colors">About</a>
        </nav>

        <div className="flex gap-8 mb-10">
          <a href="#" className="w-12 h-12 rounded-2xl border flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all text-muted-foreground hover:text-primary">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="#" className="w-12 h-12 rounded-2xl border flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all text-muted-foreground hover:text-primary">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="#" className="w-12 h-12 rounded-2xl border flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all text-muted-foreground hover:text-primary">
            <Github className="w-6 h-6" />
          </a>
        </div>

        <p className="text-sm text-muted-foreground text-center font-medium">
          &copy; {new Date().getFullYear()} WhatsCrop. All rights reserved. <br className="md:hidden" />
          Designed for the global WhatsApp community 💚
        </p>
      </div>
    </footer>
  );
}