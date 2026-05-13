'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Download, Sparkles, ImageIcon, Palette, Maximize, ZoomIn, ZoomOut, Circle, Layout, Move, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { enhanceImage } from '@/ai/flows/enhance-image-flow';
import { generateBlurredBackground } from '@/ai/flows/generate-blurred-background-flow';
import { cn } from '@/lib/utils';

type EditMode = 'blur' | 'solid' | 'fit' | 'manual';
type PreviewMode = 'square' | 'circle';

export function WhatsCropWorkspace() {
  const [image, setImage] = useState<string | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<EditMode>('blur');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('circle');
  const [blurIntensity, setBlurIntensity] = useState(30);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rectCanvasRef = useRef<HTMLCanvasElement>(null);
  const circleCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (image || processedImage) {
      const img = new Image();
      img.src = processedImage || image || '';
      img.onload = () => {
        setImageObj(img);
      };
    } else {
      setImageObj(null);
    }
  }, [image, processedImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'File too large', description: 'Maximum file size is 15MB' });
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

  const drawProcessedView = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, shape: 'square' | 'circle', isExport: boolean = false) => {
    if (!imageObj) return;
    ctx.clearRect(0, 0, width, height);

    const scaleFactor = isExport ? 1080 / 450 : 1;
    const canvasW = width;
    const canvasH = height;

    // 1. Draw Background (Blur or Solid)
    ctx.save();
    if (mode === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
      // Blur mode (or fit/manual which use blurred bg by default here)
      ctx.save();
      if (mode === 'blur') {
        ctx.filter = `blur(${isExport ? blurIntensity * 1.5 : blurIntensity}px)`;
      }
      const imgAspect = imageObj.width / imageObj.height;
      let bgW, bgH;
      if (imgAspect > 1) {
        bgH = canvasH;
        bgW = canvasH * imgAspect;
      } else {
        bgW = canvasW;
        bgH = canvasW / imgAspect;
      }
      ctx.drawImage(imageObj, (canvasW - bgW) / 2, (canvasH - bgH) / 2, bgW, bgH);
      ctx.restore();
    }
    ctx.restore();

    // 2. Draw Main Subject
    ctx.save();
    const baseScale = mode === 'fit' ? Math.min(canvasW / imageObj.width, canvasH / imageObj.height) : (mode === 'manual' ? 0.8 : Math.max(canvasW / imageObj.width, canvasH / imageObj.height));
    const finalScale = baseScale * (zoom / 100);
    const drawW = imageObj.width * finalScale;
    const drawH = imageObj.height * finalScale;
    
    const centerX = canvasW / 2 + position.x * scaleFactor;
    const centerY = canvasH / 2 + position.y * scaleFactor;

    ctx.drawImage(imageObj, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    ctx.restore();

    // 3. Apply Shape Mask (Circular)
    if (shape === 'circle' && !isExport) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(canvasW / 2, canvasH / 2, canvasW / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [imageObj, mode, blurIntensity, bgColor, zoom, position]);

  useEffect(() => {
    if (imageObj) {
      if (rectCanvasRef.current) {
        const ctx = rectCanvasRef.current.getContext('2d');
        if (ctx) drawProcessedView(ctx, 450, 450, 'square');
      }
      if (circleCanvasRef.current) {
        const ctx = circleCanvasRef.current.getContext('2d');
        if (ctx) drawProcessedView(ctx, 450, 450, 'circle');
      }
    }
  }, [drawProcessedView, imageObj]);

  const handleEnhance = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const result = await enhanceImage({ photoDataUri: image });
      setProcessedImage(result.enhancedPhotoDataUri);
      toast({ title: 'HD Enhancement Complete', description: 'Your photo is now ultra-sharp!' });
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
      toast({ title: 'AI Smart Fill Done', description: 'Generated a seamless background extension.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate background.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!imageObj) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Export 1080x1080 (Square for processing, but can be masked if user wants circle specifically)
    // Most users wanting a "WhatsApp DP" need a 1080x1080 square image that fits the circle.
    drawProcessedView(ctx, 1080, 1080, 'square', true);
    
    const link = document.createElement('a');
    link.download = 'whatsapp-hd-dp.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: 'Success!', description: 'Your 1080x1080 HD Profile Picture has been saved.' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="max-w-7xl mx-auto w-full px-4">
      <Card className="workspace-shadow border-none bg-white overflow-hidden rounded-[2.5rem]">
        {!image ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="p-20 md:p-40 flex flex-col items-center justify-center text-center cursor-pointer bg-secondary/10 hover:bg-primary/5 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-primary/10 group-hover:scale-110 transition-transform">
              <Upload className="w-14 h-14 text-primary" />
            </div>
            <h3 className="text-4xl font-headline font-bold mb-4 text-[#111B21]">Create your Full DP</h3>
            <p className="text-muted-foreground mb-10 max-w-sm text-lg font-medium">
              Drag and drop your photo here, or click to browse.
            </p>
            <Button size="lg" className="rounded-full px-16 h-16 text-xl font-bold bg-primary hover:bg-[#128C7E] text-white shadow-xl shadow-primary/30">Select Photo</Button>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row">
            <div className="flex-grow p-6 md:p-12 bg-[#F7F9FA] flex flex-col items-center gap-8 relative min-h-[600px]">
              
              <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
                {/* View Switcher Toggle */}
                <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-border">
                  <Button 
                    variant={previewMode === 'square' ? 'default' : 'ghost'} 
                    onClick={() => setPreviewMode('square')}
                    className={cn("rounded-xl px-6 gap-2", previewMode === 'square' && "bg-primary text-white hover:bg-primary/90")}
                  >
                    <Square className="w-4 h-4" /> Square View
                  </Button>
                  <Button 
                    variant={previewMode === 'circle' ? 'default' : 'ghost'} 
                    onClick={() => setPreviewMode('circle')}
                    className={cn("rounded-xl px-6 gap-2", previewMode === 'circle' && "bg-primary text-white hover:bg-primary/90")}
                  >
                    <Circle className="w-4 h-4" /> Circle View
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  {/* Square Preview (Always Square Processed) */}
                  <div className={cn("flex flex-col items-center gap-4 transition-all duration-500", previewMode !== 'square' && "opacity-40 scale-95 hidden md:flex")}>
                    <div className="flex items-center gap-2 mb-2 text-[#111B21]/60 font-bold uppercase tracking-widest text-xs">
                      <Layout className="w-4 h-4" /> Square Result
                    </div>
                    <div 
                      className="relative w-full aspect-square bg-white shadow-2xl overflow-hidden rounded-[2rem] cursor-move border-4 border-white"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <canvas ref={rectCanvasRef} width={450} height={450} className="w-full h-full" />
                    </div>
                  </div>

                  {/* Circle Preview (Always Circular Processed) */}
                  <div className={cn("flex flex-col items-center gap-4 transition-all duration-500", previewMode !== 'circle' && "opacity-40 scale-95 hidden md:flex")}>
                    <div className="flex items-center gap-2 mb-2 text-primary font-bold uppercase tracking-widest text-xs">
                      <Circle className="w-4 h-4" /> WhatsApp DP Preview
                    </div>
                    <div 
                      className="relative w-full aspect-square bg-white shadow-2xl overflow-hidden rounded-full border-4 border-white cursor-move"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <canvas ref={circleCanvasRef} width={450} height={450} className="w-full h-full" />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
                  <Move className="w-4 h-4" /> Drag to adjust framing
                </p>
              </div>

              <div className="absolute top-6 right-6 flex gap-3">
                <Button variant="outline" size="icon" onClick={() => { setImage(null); setProcessedImage(null); }} className="rounded-full bg-white/80 backdrop-blur-sm border-none shadow-lg text-destructive hover:bg-destructive/10 h-12 w-12">
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="w-full xl:w-[450px] border-t xl:border-t-0 xl:border-l p-10 flex flex-col gap-10 bg-white">
              <div>
                <h4 className="text-xs font-bold text-[#111B21]/40 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" /> Background Style
                </h4>
                <Tabs value={mode} onValueChange={(v) => setMode(v as EditMode)} className="w-full">
                  <TabsList className="grid grid-cols-2 gap-4 bg-transparent h-auto p-0">
                    <TabsTrigger value="blur" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary py-5 flex flex-col gap-2 rounded-3xl border-2 bg-secondary/10 text-muted-foreground transition-all hover:border-primary/20">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-xs font-bold">Crop with Blur</span>
                    </TabsTrigger>
                    <TabsTrigger value="solid" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary py-5 flex flex-col gap-2 rounded-3xl border-2 bg-secondary/10 text-muted-foreground transition-all hover:border-primary/20">
                      <Palette className="w-6 h-6" />
                      <span className="text-xs font-bold">Crop with Color</span>
                    </TabsTrigger>
                    <TabsTrigger value="fit" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary py-5 flex flex-col gap-2 rounded-3xl border-2 bg-secondary/10 text-muted-foreground transition-all hover:border-primary/20">
                      <Maximize className="w-6 h-6" />
                      <span className="text-xs font-bold">Fit Full Size</span>
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary py-5 flex flex-col gap-2 rounded-3xl border-2 bg-secondary/10 text-muted-foreground transition-all hover:border-primary/20">
                      <Circle className="w-6 h-6" />
                      <span className="text-xs font-bold">Manual Square</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {mode === 'blur' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#111B21]">Blur Intensity</label>
                    <span className="text-sm font-mono font-bold text-primary px-3 py-1 bg-primary/5 rounded-lg">{blurIntensity}%</span>
                  </div>
                  <Slider value={[blurIntensity]} onValueChange={([v]) => setBlurIntensity(v)} max={100} className="py-2" />
                  <Button variant="outline" className="w-full gap-2 py-8 border-primary/20 text-primary hover:bg-primary/5 rounded-[1.5rem] font-bold text-base" onClick={handleAIBlur} disabled={isProcessing}>
                    <Sparkles className="w-5 h-5" />
                    {isProcessing ? 'Processing AI...' : 'AI Smart Background Fill'}
                  </Button>
                </div>
              )}

              {mode === 'solid' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-bold text-[#111B21]">Background Color</label>
                  <div className="grid grid-cols-6 gap-3">
                    {['#FFFFFF', '#F0F2F5', '#25D366', '#128C7E', '#111B21', '#E7E9ED'].map((color) => (
                      <button
                        key={color}
                        className={cn("aspect-square rounded-full border-4 transition-all hover:scale-110", bgColor === color ? "border-primary shadow-lg shadow-primary/20" : "border-white shadow-sm")}
                        style={{ backgroundColor: color }}
                        onClick={() => setBgColor(color)}
                      />
                    ))}
                    <div className="relative aspect-square">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-full rounded-full border-none p-0 overflow-hidden cursor-pointer opacity-0 absolute inset-0" />
                      <div className="w-full h-full rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center bg-secondary/20">
                        <Palette className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ZoomIn className="w-5 h-5 text-primary" />
                    <label className="text-sm font-bold text-[#111B21]">Zoom Level</label>
                  </div>
                  <span className="text-sm font-mono font-bold text-primary px-3 py-1 bg-primary/5 rounded-lg">{zoom}%</span>
                </div>
                <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={10} max={400} className="py-2" />
                <div className="flex gap-4">
                  <Button variant="secondary" className="flex-1 rounded-2xl h-12 bg-secondary/50 font-bold" onClick={() => setZoom(Math.max(10, zoom - 20))}><ZoomOut className="w-4 h-4 mr-2" /> Out</Button>
                  <Button variant="secondary" className="flex-1 rounded-2xl h-12 bg-secondary/50 font-bold" onClick={() => setZoom(Math.min(400, zoom + 20))}><ZoomIn className="w-4 h-4 mr-2" /> In</Button>
                </div>
              </div>

              <div className="mt-auto pt-4 flex flex-col gap-4">
                <Button variant="outline" className="w-full gap-2 py-8 border-primary/20 text-[#128C7E] hover:bg-[#128C7E]/5 rounded-[1.5rem] font-bold text-lg transition-all" onClick={handleEnhance} disabled={isProcessing}>
                  <Sparkles className="w-6 h-6" />
                  {isProcessing ? 'Enhancing to HD...' : 'AI HD Enhancement'}
                </Button>
                <Button className="w-full gap-4 py-10 text-2xl font-bold rounded-[1.5rem] shadow-[0_20px_40px_-15px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-95 transition-all bg-primary hover:bg-[#128C7E] text-white" onClick={handleDownload} disabled={isProcessing || !imageObj}>
                  <Download className="w-8 h-8" />
                  Download HD DP
                </Button>
                
                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="flex items-center gap-2 text-[10px] text-[#111B21]/40 font-bold uppercase tracking-[0.2em]">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
                    Ultra HD 1080px Quality
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium text-center">
                    Instant Download • No Watermark • Clean Result
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}