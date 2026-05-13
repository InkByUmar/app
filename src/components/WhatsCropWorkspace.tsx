'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, X, Download, Sparkles, ImageIcon, Palette, 
  Maximize, ZoomIn, ZoomOut, Circle, Layout, Move, Square,
  CheckCircle2, AlertCircle
} from 'lucide-react';
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload an image.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImage(result);
        setProcessedImage(null);
        setZoom(100);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImage(result);
        setProcessedImage(null);
        setZoom(100);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    } else {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please drop an image file.' });
    }
  };

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

  const drawProcessedView = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, shape: 'square' | 'circle', isExport: boolean = false) => {
    if (!imageObj) return;
    ctx.clearRect(0, 0, width, height);

    const canvasW = width;
    const canvasH = height;

    // 1. Draw Background
    ctx.save();
    if (mode === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
      ctx.save();
      if (mode === 'blur' || mode === 'fit' || mode === 'manual') {
        ctx.filter = `blur(${isExport ? blurIntensity * 2.4 : blurIntensity}px)`;
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
    
    const centerX = canvasW / 2 + position.x * (isExport ? 1080 / 450 : 1);
    const centerY = canvasH / 2 + position.y * (isExport ? 1080 / 450 : 1);

    ctx.drawImage(imageObj, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    ctx.restore();

    // 3. Apply Shape Mask
    if (shape === 'circle') {
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
      const render = () => {
        if (previewMode === 'square' && rectCanvasRef.current) {
          const ctx = rectCanvasRef.current.getContext('2d');
          if (ctx) drawProcessedView(ctx, 450, 450, 'square');
        } else if (previewMode === 'circle' && circleCanvasRef.current) {
          const ctx = circleCanvasRef.current.getContext('2d');
          if (ctx) drawProcessedView(ctx, 450, 450, 'circle');
        }
      };
      const rafId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(rafId);
    }
  }, [drawProcessedView, imageObj, previewMode]);

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
    
    drawProcessedView(ctx, 1080, 1080, previewMode, true);
    
    const link = document.createElement('a');
    link.download = `whatsapp-${previewMode}-dp.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: 'Success!', description: `Your 1080x1080 HD ${previewMode === 'circle' ? 'Circular' : 'Square'} Profile Picture has been saved.` });
  };

  // Mouse Handlers
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

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }
  };
  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 mb-20">
      <Card className="workspace-shadow border-none bg-white overflow-hidden rounded-[2.5rem] md:rounded-[3rem]">
        {!image ? (
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="p-12 md:p-40 flex flex-col items-center justify-center text-center cursor-pointer bg-secondary/10 hover:bg-primary/5 transition-all group relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl" />

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-primary/10 group-hover:scale-110 transition-transform duration-500 z-10">
              <Upload className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
            <h3 className="text-3xl md:text-5xl font-headline font-bold mb-4 text-[#111B21] z-10">Create your Full DP</h3>
            <p className="text-muted-foreground mb-10 max-w-sm text-base md:text-xl font-medium z-10">
              Drag and drop your photo here, or tap to browse your gallery.
            </p>
            <Button size="lg" className="rounded-full px-12 md:px-20 h-16 md:h-20 text-lg md:text-2xl font-bold bg-primary hover:bg-[#128C7E] text-white shadow-xl shadow-primary/30 z-10 transition-all hover:scale-105">
              Select Photo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row">
            {/* Preview Section */}
            <div className="flex-grow p-4 md:p-12 bg-[#F7F9FA] flex flex-col items-center gap-6 md:gap-10 relative min-h-[500px] md:min-h-[700px]">
              
              <div className="flex flex-col items-center gap-6 md:gap-10 w-full max-w-2xl">
                {/* Responsive View Switcher */}
                <div className="flex p-1.5 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 w-full max-w-md">
                  <Button 
                    variant={previewMode === 'square' ? 'default' : 'ghost'} 
                    onClick={() => setPreviewMode('square')}
                    className={cn("flex-1 rounded-xl px-4 gap-2 h-12 md:h-14 font-bold transition-all", previewMode === 'square' ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}
                  >
                    <Square className="w-5 h-5" /> <span className="hidden sm:inline">Square View</span> <span className="sm:hidden">Square</span>
                  </Button>
                  <Button 
                    variant={previewMode === 'circle' ? 'default' : 'ghost'} 
                    onClick={() => setPreviewMode('circle')}
                    className={cn("flex-1 rounded-xl px-4 gap-2 h-12 md:h-14 font-bold transition-all", previewMode === 'circle' ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}
                  >
                    <Circle className="w-5 h-5" /> <span className="hidden sm:inline">Circle View</span> <span className="sm:hidden">Circle</span>
                  </Button>
                </div>

                {/* Canvas Container */}
                <div className="w-full max-w-[450px] relative">
                  {previewMode === 'square' ? (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#111B21]/40 uppercase tracking-widest mb-2">
                        <Layout className="w-4 h-4 text-primary" /> 1:1 HD Square Preview
                      </div>
                      <div 
                        className="relative w-full aspect-square bg-white shadow-2xl overflow-hidden rounded-[2.5rem] cursor-move border-8 border-white group"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <canvas ref={rectCanvasRef} width={450} height={450} className="w-full h-full" />
                        <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-[2rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-2">
                        <Circle className="w-4 h-4" /> WhatsApp Circle Preview
                      </div>
                      <div 
                        className="relative w-full aspect-square bg-white shadow-2xl overflow-hidden rounded-full border-8 border-white cursor-move group"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <canvas ref={circleCanvasRef} width={450} height={450} className="w-full h-full" />
                        <div className="absolute inset-0 rounded-full ring-2 ring-dashed ring-primary/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <p className="text-sm text-muted-foreground font-semibold flex items-center justify-center gap-2 bg-white/60 px-6 py-3 rounded-full border border-white/50 backdrop-blur-sm shadow-sm">
                    <Move className="w-4 h-4 text-primary" /> Drag image to adjust center
                  </p>
                </div>
              </div>

              {/* Reset Button */}
              <div className="absolute top-6 right-6 flex gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => { setImage(null); setProcessedImage(null); }} 
                  className="rounded-2xl bg-white/80 backdrop-blur-sm border-none shadow-xl text-destructive hover:bg-destructive hover:text-white h-12 w-12 transition-all hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Controls Section */}
            <div className="w-full xl:w-[500px] border-t xl:border-t-0 xl:border-l p-6 md:p-12 flex flex-col gap-10 bg-white">
              {/* Style Section */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-[#111B21]/30 uppercase tracking-[0.3em] flex items-center gap-3">
                  <ImageIcon className="w-4 h-4 text-primary" /> Background Treatment
                </h4>
                <Tabs value={mode} onValueChange={(v) => setMode(v as EditMode)} className="w-full">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-transparent h-auto p-0">
                    <TabsTrigger value="blur" className="data-[state=active]:bg-primary data-[state=active]:text-white py-4 md:py-6 flex flex-col gap-2 rounded-2xl md:rounded-3xl border-2 bg-secondary/20 transition-all hover:border-primary/30">
                      <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="text-[10px] md:text-xs font-black uppercase">Blur</span>
                    </TabsTrigger>
                    <TabsTrigger value="solid" className="data-[state=active]:bg-primary data-[state=active]:text-white py-4 md:py-6 flex flex-col gap-2 rounded-2xl md:rounded-3xl border-2 bg-secondary/20 transition-all hover:border-primary/30">
                      <Palette className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="text-[10px] md:text-xs font-black uppercase">Color</span>
                    </TabsTrigger>
                    <TabsTrigger value="fit" className="data-[state=active]:bg-primary data-[state=active]:text-white py-4 md:py-6 flex flex-col gap-2 rounded-2xl md:rounded-3xl border-2 bg-secondary/20 transition-all hover:border-primary/30">
                      <Maximize className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="text-[10px] md:text-xs font-black uppercase">Fit</span>
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="data-[state=active]:bg-primary data-[state=active]:text-white py-4 md:py-6 flex flex-col gap-2 rounded-2xl md:rounded-3xl border-2 bg-secondary/20 transition-all hover:border-primary/30">
                      <Layout className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="text-[10px] md:text-xs font-black uppercase">Free</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Contextual Options */}
              <div className="space-y-8 min-h-[120px]">
                {mode === 'blur' && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-black text-[#111B21] uppercase tracking-wider">Blur Amount</label>
                      <span className="text-sm font-mono font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg">{blurIntensity}%</span>
                    </div>
                    <Slider value={[blurIntensity]} onValueChange={([v]) => setBlurIntensity(v)} max={100} className="py-2" />
                    <Button 
                      variant="outline" 
                      className="w-full gap-3 h-16 md:h-20 border-primary/20 text-primary hover:bg-primary/5 rounded-3xl font-black uppercase tracking-widest text-sm transition-all shadow-sm" 
                      onClick={handleAIBlur} 
                      disabled={isProcessing}
                    >
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                      {isProcessing ? 'Processing AI...' : 'AI Smart Background Fill'}
                    </Button>
                  </div>
                )}

                {mode === 'solid' && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <label className="text-sm font-black text-[#111B21] uppercase tracking-wider">Background Color</label>
                    <div className="grid grid-cols-5 md:grid-cols-7 gap-3">
                      {['#FFFFFF', '#F0F2F5', '#25D366', '#128C7E', '#111B21', '#E7E9ED', '#FF5B5B'].map((color) => (
                        <button
                          key={color}
                          className={cn("aspect-square rounded-full border-4 transition-all hover:scale-110", bgColor === color ? "border-primary shadow-lg shadow-primary/30 scale-110" : "border-white shadow-sm hover:border-primary/20")}
                          style={{ backgroundColor: color }}
                          onClick={() => setBgColor(color)}
                        />
                      ))}
                      <div className="relative aspect-square">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-full rounded-full border-none p-0 overflow-hidden cursor-pointer opacity-0 absolute inset-0 z-10" />
                        <div className="w-full h-full rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-secondary/30 transition-colors hover:bg-primary/10">
                          <Palette className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Always show Zoom controls for better accessibility */}
                <div className="space-y-6 animate-in fade-in duration-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ZoomIn className="w-5 h-5 text-primary" />
                      <label className="text-sm font-black text-[#111B21] uppercase tracking-wider">Scale Level</label>
                    </div>
                    <span className="text-sm font-mono font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg">{zoom}%</span>
                  </div>
                  <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={10} max={400} className="py-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" className="rounded-2xl h-12 md:h-14 bg-secondary font-black uppercase text-[10px] md:text-xs" onClick={() => setZoom(Math.max(10, zoom - 20))}><ZoomOut className="w-4 h-4 mr-2" /> Small</Button>
                    <Button variant="secondary" className="rounded-2xl h-12 md:h-14 bg-secondary font-black uppercase text-[10px] md:text-xs" onClick={() => setZoom(Math.min(400, zoom + 20))}><ZoomIn className="w-4 h-4 mr-2" /> Large</Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-4 pt-10">
                <Button 
                  variant="outline" 
                  className="w-full gap-3 h-16 md:h-20 border-primary/30 text-[#128C7E] hover:bg-[#128C7E]/5 rounded-3xl font-black uppercase tracking-widest text-sm md:text-base transition-all group" 
                  onClick={handleEnhance} 
                  disabled={isProcessing}
                >
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  {isProcessing ? 'Enhancing to HD...' : 'AI HD Enhancement'}
                </Button>
                
                <Button 
                  className="w-full gap-4 h-20 md:h-24 text-xl md:text-3xl font-black rounded-3xl shadow-[0_25px_50px_-15px_rgba(37,211,102,0.4)] hover:scale-[1.03] active:scale-95 transition-all bg-primary hover:bg-[#128C7E] text-white group" 
                  onClick={handleDownload} 
                  disabled={isProcessing || !imageObj}
                >
                  <Download className="w-8 h-8 md:w-10 md:h-10 group-hover:-translate-y-1 transition-transform" />
                  Download HD DP
                </Button>
                
                <div className="flex flex-col items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 text-[10px] text-[#111B21]/30 font-black uppercase tracking-[0.3em]">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    Ultra HD 1080px Quality
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold text-center bg-secondary/50 px-4 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    No Watermark • 100% Free • Secure
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}