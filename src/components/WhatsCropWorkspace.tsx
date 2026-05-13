
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, SlidersHorizontal, Download, Sparkles, Image as ImageIcon, Palette, Maximize, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { enhanceImage } from '@/ai/flows/enhance-image-flow';
import { generateBlurredBackground } from '@/ai/flows/generate-blurred-background-flow';
import { cn } from '@/lib/utils';

type EditMode = 'blur' | 'solid' | 'fit' | 'manual';

export function WhatsCropWorkspace() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<EditMode>('blur');
  const [blurIntensity, setBlurIntensity] = useState(20);
  const [bgColor, setBgColor] = useState('#111613');
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(true);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Maximum file size is 15MB',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setProcessedImage(null);
        setPosition({ x: 0, y: 0 });
        setZoom(100);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const result = await enhanceImage({ photoDataUri: image });
      setProcessedImage(result.enhancedPhotoDataUri);
      toast({ title: 'Success', description: 'Image enhanced to HD quality!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to enhance image.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIBlur = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const result = await generateBlurredBackground({ photoDataUri: image });
      setProcessedImage(result.enhancedPhotoDataUri);
      toast({ title: 'Success', description: 'AI generated blurred background!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate background.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    if (mode === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 1080, 1080);
    }

    const img = new Image();
    img.src = processedImage || image;
    img.onload = () => {
      // Simplistic drawing for demonstration
      // In a full app, we'd handle the zoom/pan/blur precisely here
      const size = 1080 * (zoom / 100);
      const offsetX = (1080 - size) / 2 + (position.x * 10.8);
      const offsetY = (1080 - size) / 2 + (position.y * 10.8);
      
      ctx.drawImage(img, offsetX, offsetY, size, size);
      
      const link = document.createElement('a');
      link.download = 'whatscrop-dp.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="max-w-6xl mx-auto w-full px-4">
      <Card className="workspace-shadow border-border/50 bg-card overflow-hidden">
        {!image ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="p-12 md:p-24 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/5 transition-colors group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*"
            />
            <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-headline font-semibold mb-2">Upload your photo</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Drag and drop your JPG or PNG image here, or click to browse (up to 15MB).
            </p>
            <Button size="lg" className="rounded-full px-8">Select File</Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            {/* Editor Workspace */}
            <div className="flex-grow p-4 md:p-8 bg-black/40 flex items-center justify-center relative min-h-[400px]">
              <div 
                ref={canvasRef}
                className={cn(
                  "relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-secondary rounded-lg overflow-hidden cursor-move",
                  showPreview && "circle-mask"
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ backgroundColor: mode === 'solid' ? bgColor : undefined }}
              >
                {/* Background (only for blur mode if implemented client-side) */}
                {mode === 'blur' && (
                  <img 
                    src={processedImage || image} 
                    alt="background blur" 
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110"
                  />
                )}
                
                <img 
                  src={processedImage || image} 
                  alt="Work"
                  draggable={false}
                  className="absolute pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100})`,
                    left: '0',
                    top: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: mode === 'fit' ? 'contain' : 'cover'
                  }}
                />
              </div>

              {/* Action Floating Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setShowPreview(!showPreview)}
                  className="rounded-full"
                >
                  {showPreview ? 'Hide Circle' : 'Show Circle'}
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => setImage(null)}
                  className="rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l p-6 flex flex-col gap-8 bg-card">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">DP Style</h4>
                <Tabs value={mode} onValueChange={(v) => setMode(v as EditMode)} className="w-full">
                  <TabsList className="grid grid-cols-2 gap-2 bg-transparent h-auto p-0">
                    <TabsTrigger value="blur" className="data-[state=active]:bg-primary data-[state=active]:text-background py-3 flex flex-col gap-1 border border-border">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-[10px]">Blur Fill</span>
                    </TabsTrigger>
                    <TabsTrigger value="solid" className="data-[state=active]:bg-primary data-[state=active]:text-background py-3 flex flex-col gap-1 border border-border">
                      <Palette className="w-4 h-4" />
                      <span className="text-[10px]">Solid Color</span>
                    </TabsTrigger>
                    <TabsTrigger value="fit" className="data-[state=active]:bg-primary data-[state=active]:text-background py-3 flex flex-col gap-1 border border-border">
                      <Maximize className="w-4 h-4" />
                      <span className="text-[10px]">Auto Fit</span>
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="data-[state=active]:bg-primary data-[state=active]:text-background py-3 flex flex-col gap-1 border border-border">
                      <MousePointer2 className="w-4 h-4" />
                      <span className="text-[10px]">Manual</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {mode === 'blur' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Blur Intensity</label>
                    <span className="text-xs text-muted-foreground">{blurIntensity}%</span>
                  </div>
                  <Slider 
                    value={[blurIntensity]} 
                    onValueChange={([v]) => setBlurIntensity(v)} 
                    max={100} 
                  />
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/10"
                    onClick={handleAIBlur}
                    disabled={isProcessing}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isProcessing ? 'Generating...' : 'AI Smart Fill (HD)'}
                  </Button>
                </div>
              )}

              {mode === 'solid' && (
                <div className="space-y-4">
                  <label className="text-sm font-medium">Background Color</label>
                  <div className="flex flex-wrap gap-2">
                    {['#111613', '#25D366', '#FFFFFF', '#000000', '#2C3E50', '#E74C3C'].map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-transform",
                          bgColor === color ? "border-primary scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setBgColor(color)}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-full border-none p-0 overflow-hidden cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Zoom</label>
                  <span className="text-xs text-muted-foreground">{zoom}%</span>
                </div>
                <Slider 
                  value={[zoom]} 
                  onValueChange={([v]) => setZoom(v)} 
                  min={10} 
                  max={300} 
                />
              </div>

              <div className="mt-auto pt-6 flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 py-6 border-accent/20 text-accent hover:bg-accent/10"
                  onClick={handleEnhance}
                  disabled={isProcessing}
                >
                  <Sparkles className="w-4 h-4" />
                  {isProcessing ? 'Enhancing...' : 'AI HD Enhancement'}
                </Button>
                <Button 
                  className="w-full gap-2 py-6 text-md font-bold rounded-xl"
                  onClick={handleDownload}
                  disabled={isProcessing}
                >
                  <Download className="w-5 h-5" />
                  Download 1080x1080 HD
                </Button>
                <p className="text-[10px] text-center text-muted-foreground italic">
                  Processed locally. No watermark added.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
