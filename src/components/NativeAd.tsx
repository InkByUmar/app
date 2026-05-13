'use client';

import React from 'react';

interface NativeAdProps {
  className?: string;
}

export function NativeAd({ className }: NativeAdProps) {
  return (
    <div className={`w-full flex justify-center ${className || ''}`}>
      <div className="w-full max-w-4xl overflow-hidden flex flex-col items-center">
        {/* Ad Container */}
        <div id="container-87432722d80db14701cb21e3bd1c4184" className="w-full"></div>
        {/* Ad Script */}
        <script 
          async 
          data-cfasync="false" 
          src="https://archaicmsflip.com/87432722d80db14701cb21e3bd1c4184/invoke.js"
        />
      </div>
    </div>
  );
}
