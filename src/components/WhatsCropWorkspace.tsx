'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, X, Download, ImageIcon, Palette, 
  Maximize, ZoomIn, ZoomOut, Circle, Layout, Move, Square,
  CheckCircle2, AlertCircle, Sun, Contrast, Droplets, SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { NativeAd } from '@/components/NativeAd';

type EditMode = 'blur' | 'solid' | 'fit' | 'manual';
type PreviewMode = 'square' | 'circle';

export function WhatsCropWorkspace() {
  const [image, setImage] = useState<string | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<EditMode>('blur');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('circle');
  const [blurIntensity, setBlurIntensity] = useState(30);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Pinch zoom tracking
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(100);

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
        setZoom(100);
        setPosition({ x: 0, y: 0 });
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
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
        setZoom(100);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    } else {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please drop an image file.' });
    }
  };

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        setImageObj(img);
      };
    } else {
      setImageObj(null);
    }
  }, [image]);

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
      // Apply filters only to the blurred background if needed, or globally
      const blurVal = isExport ? blurIntensity * 2.4 : blurIntensity;
      ctx.filter = `blur(${blurVal}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      
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
    // Apply brightness/contrast to main subject too
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    const baseScale = mode === 'fit' ? Math.min(canvasW / imageObj.width, canvasH / imageObj.height) : (mode === 'manual' ? 0.8 : Math.max(canvasW / imageObj.width, canvasH / imageObj.height));
    const finalScale = baseScale * (zoom / 100);
    const drawW = imageObj.width * finalScale;
    const drawH = imageObj.height * finalScale;
    
    const scaleFactor = isExport ? 1080 / 450 : 1;
    const centerX = canvasW / 2 + position.x * scaleFactor;
    const centerY = canvasH / 2 + position.y * scaleFactor;

    ctx.drawImage(imageObj, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    ctx.restore();

    // 3. Apply Shape Mask (Only for UI previews, not exported image)
    if (shape === 'circle' && !isExport) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(canvasW / 2, canvasH / 2, canvasW / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [imageObj, mode, blurIntensity, bgColor, zoom, position, brightness, contrast, saturation]);

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

  const handleDownload = () => {
    if (!imageObj) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Always draw as square for export
    drawProcessedView(ctx, 1080, 1080, 'square', true);
    
    const link = document.createElement('a');
    link.download = `whatsquality-hd-dp.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    toast({ 
      title: 'Success!', 
      description: `Your 1080x1080 HD Square Profile Picture has been saved.` 
    });
  };

  // Interaction Handlers
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

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.5;
    const delta = -e.deltaY;
    setZoom((prev) => {
      const nextZoom = prev + (delta * (zoomSpeed / 10));
      return Math.min(400, Math.max(10, nextZoom));
    });
  };

  const getDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = getDistance(e.touches);
      initialPinchDistanceRef.current = dist;
      initialZoomRef.current = zoom;
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
      const currentDist = getDistance(e.touches);
      const scale = currentDist / initialPinchDistanceRef.current;
      const nextZoom = initialZoomRef.current * scale;
      setZoom(Math.min(400, Math.max(10, nextZoom)));
    } else if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    initialPinchDistanceRef.current = null;
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 mb-20">
      <Card className="workspace-shadow border-none bg-white overflow-hidden rounded-[2rem] md:rounded-[2.5rem]">
        {!image ? (
          <>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="p-12 md:p-32 flex flex-col items-center justify-center text-center cursor-pointer bg-secondary/10 hover:bg-primary/5 transition-all group relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl" />

              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-primary/10 group-hover:scale-110 transition-transform duration-500 z-10">
                <Upload className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
              <h3 className="text-2xl md:text-4xl font-headline font-bold mb-3 text-[#111B21] z-10">Create your Full DP</h3>
              <p className="text-muted-foreground mb-8 max-w-sm text-sm md:text-lg font-medium z-10">
                Drag and drop your photo here, or tap to browse your gallery.
              </p>
              <Button size="lg" className="rounded-full px-10 md:px-16 h-14 md:h-16 text-base md:text-xl font-bold bg-primary hover:bg-[#128C7E] text-white shadow-xl shadow-primary/30 z-10 transition-all hover:scale-105">
                Select Photo
              </Button>
            </div>
            <NativeAd className="px-6 border-t border-secondary/10" />
          </>
        ) : (
          <div className="flex flex-col items-center p-4 md:p-8 gap-6">
            {/* 1. View Selection Toggles - Compact */}
            <div className="flex p-1 bg-secondary/20 backdrop-blur-md rounded-xl shadow-inner w-full max-w-sm mx-auto">
              <Button 
                variant={previewMode === 'square' ? 'default' : 'ghost'} 
                onClick={() => setPreviewMode('square')}
                className={cn("flex-1 rounded-lg px-3 gap-2 h-10 text-xs font-bold transition-all", previewMode === 'square' ? "bg-primary text-white shadow-md" : "text-muted-foreground")}
              >
                <Square className="w-4 h-4" /> <span>Square</span>
              </Button>
              <Button 
                variant={previewMode === 'circle' ? 'default' : 'ghost'} 
                onClick={() => setPreviewMode('circle')}
                className={cn("flex-1 rounded-lg px-3 gap-2 h-10 text-xs font-bold transition-all", previewMode === 'circle' ? "bg-primary text-white shadow-md" : "text-muted-foreground")}
              >
                <Circle className="w-4 h-4" /> <span>Circle</span>
              </Button>
            </div>

            {/* 2. Main Preview Area */}
            <div className="w-full max-w-[500px] relative animate-in fade-in zoom-in-95 duration-700">
              <div 
                className={cn(
                  "relative w-full aspect-square bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden cursor-move border-[8px] border-white touch-none group",
                  previewMode === 'circle' ? "rounded-full" : "rounded-[2rem]"
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
              >
                <canvas 
                  ref={previewMode === 'square' ? rectCanvasRef : circleCanvasRef} 
                  width={450} 
                  height={450} 
                  className="w-full h-full" 
                />
                <div className={cn(
                  "absolute inset-0 border-2 border-dashed border-primary/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity",
                  previewMode === 'circle' ? "rounded-full" : "rounded-[1.5rem]"
                )} />
              </div>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => { setImage(null); setImageObj(null); }} 
                className="absolute -top-2 -right-2 rounded-xl bg-white shadow-lg text-destructive hover:bg-destructive hover:text-white h-10 w-10 border-none transition-all hover:rotate-90 z-20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* 3. Integrated Controls - Optimized Space */}
            <div className="w-full max-w-xl space-y-6">
              
              {/* Scale Control - Compact */}
              <div className="bg-secondary/10 p-4 rounded-[1.5rem] space-y-3 border border-white">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#111B21]/60">Image Scale</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">{zoom}%</span>
                </div>
                <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={10} max={400} className="py-1" />
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1 rounded-lg h-9 bg-white text-xs font-bold" onClick={() => setZoom(Math.max(10, zoom - 10))}>
                    <ZoomOut className="w-3.5 h-3.5 mr-1.5" /> Smaller
                  </Button>
                  <Button variant="secondary" className="flex-1 rounded-lg h-9 bg-white text-xs font-bold" onClick={() => setZoom(Math.min(400, zoom + 10))}>
                    <ZoomIn className="w-3.5 h-3.5 mr-1.5" /> Larger
                  </Button>
                </div>
              </div>

              {/* Tabs for Editing Modes - Compact */}
              <Tabs defaultValue="background" className="w-full">
                <TabsList className="grid grid-cols-2 bg-secondary/20 p-1 rounded-xl h-auto mb-4">
                  <TabsTrigger value="background" className="rounded-lg py-2 text-xs font-bold gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <ImageIcon className="w-3.5 h-3.5" /> Background
                  </TabsTrigger>
                  <TabsTrigger value="adjust" className="rounded-lg py-2 text-xs font-bold gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="background" className="space-y-4 animate-in slide-in-from-bottom-1 duration-300 mt-0">
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { id: 'blur', icon: ImageIcon, label: 'Blur' },
                      { id: 'solid', icon: Palette, label: 'Color' },
                      { id: 'fit', icon: Maximize, label: 'Fit' },
                      { id: 'manual', icon: Layout, label: 'Manual' }
                    ] as const).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setMode(item.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all gap-1",
                          mode === item.id ? "bg-primary text-white border-primary shadow-md" : "bg-white border-secondary/50 hover:border-primary/30"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {mode === 'blur' && (
                    <div className="p-3 bg-secondary/5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Blur Intensity</label>
                        <span className="text-xs font-bold text-primary">{blurIntensity}%</span>
                      </div>
                      <Slider value={[blurIntensity]} onValueChange={([v]) => setBlurIntensity(v)} max={100} />
                    </div>
                  )}

                  {mode === 'solid' && (
                    <div className="p-3 bg-secondary/5 rounded-2xl space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Background Color</label>
                      <div className="flex flex-wrap gap-2">
                        {['#FFFFFF', '#F0F2F5', '#25D366', '#128C7E', '#111B21', '#FF5B5B', '#FFD93D'].map((color) => (
                          <button
                            key={color}
                            className={cn("w-7 h-7 rounded-full border-2 transition-all", bgColor === color ? "border-primary scale-105" : "border-white")}
                            style={{ backgroundColor: color }}
                            onClick={() => setBgColor(color)}
                          />
                        ))}
                        <div className="relative w-7 h-7">
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-full rounded-full border-none p-0 overflow-hidden cursor-pointer absolute opacity-0 z-10" />
                          <div className="w-full h-full rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center bg-white">
                            <Palette className="w-3 h-3 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="adjust" className="space-y-3 animate-in slide-in-from-bottom-1 duration-300 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-secondary/5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Brightness</span>
                        </div>
                        <span className="text-xs font-bold text-primary">{brightness}%</span>
                      </div>
                      <Slider value={[brightness]} onValueChange={([v]) => setBrightness(v)} min={0} max={200} />
                    </div>

                    <div className="p-3 bg-secondary/5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Contrast className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Contrast</span>
                        </div>
                        <span className="text-xs font-bold text-primary">{contrast}%</span>
                      </div>
                      <Slider value={[contrast]} onValueChange={([v]) => setContrast(v)} min={0} max={200} />
                    </div>

                    <div className="p-3 bg-secondary/5 rounded-2xl space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Saturation</span>
                        </div>
                        <span className="text-xs font-bold text-primary">{saturation}%</span>
                      </div>
                      <Slider value={[saturation]} onValueChange={([v]) => setSaturation(v)} min={0} max={200} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Download & Final Stats - Optimized */}
              <div className="pt-2 space-y-4">
                <Button 
                  className="w-full gap-3 h-16 md:h-20 text-lg md:text-2xl font-black rounded-2xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all bg-primary hover:bg-[#128C7E] text-white group" 
                  onClick={handleDownload} 
                  disabled={!imageObj}
                >
                  <Download className="w-6 h-6 md:w-7 md:h-7 group-hover:-translate-y-1 transition-transform" />
                  Download HD DP
                </Button>

                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 text-[8px] md:text-[10px] text-muted-foreground font-bold bg-secondary/30 px-4 py-2 rounded-full border border-white">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> 1080px HD</span>
                    <span className="w-px h-2.5 bg-muted-foreground/30" />
                    <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-primary" /> No Watermark</span>
                  </div>
                  <NativeAd className="mt-2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
