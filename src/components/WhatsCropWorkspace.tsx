'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Download, Sparkles, ImageIcon, Palette, Maximize, MousePointer2, ZoomIn, ZoomOut, Circle, Eye, EyeOff, Layout } from 'lucide-react';
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
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<EditMode>('blur');
  const [isCircleMode, setIsCircleMode] = useState(false); // false = Rectangular, true = Circular
  const [blurIntensity, setBlurIntensity] = useState(30);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (image || processedImage) {
      const img = new Image();
      img.src = processedImage || image || '';
      img.onload = () => {
        setImageObj(img);
        // Default to rectangular view on fresh upload
        if (!processedImage) setIsCircleMode(false);
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
        setIsCircleMode(false);
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
        setIsCircleMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawWorkspace = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, isExport: boolean = false, forceCircle: boolean = false) => {
    if (!imageObj) return;

    const showAsCircle = forceCircle || isCircleMode;

    ctx.clearRect(0, 0, width, height);

    if (!showAsCircle && !isExport) {
      // RECTANGULAR VIEW: Just show the original image fitted
      const imgAspect = imageObj.width / imageObj.height;
      let drawW, drawH;
      if (imgAspect > 1) {
        drawW = width;
        drawH = width / imgAspect;
      } else {
        drawH = height;
        drawW = height * imgAspect;
      }
      ctx.drawImage(imageObj, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
      return;
    }

    // CIRCULAR/EXPORT MODE: Full square composition with backgrounds
    if (mode === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    } else if (mode === 'blur' || mode === 'fit' || mode === 'manual') {
      ctx.save();
      if (mode === 'blur') {
        ctx.filter = `blur(${isExport ? blurIntensity * 1.5 : blurIntensity}px)`;
      }
      const imgAspect = imageObj.width / imageObj.height;
      let drawW, drawH;
      if (imgAspect > 1) {
        drawH = height;
        drawW = height * imgAspect;
      } else {
        drawW = width;
        drawH = width / imgAspect;
      }
      ctx.drawImage(imageObj, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
      ctx.restore();
    }

    // Draw the subject (the actual DP)
    ctx.save();
    const baseScale = mode === 'fit' ? Math.min(width / imageObj.width, height / imageObj.height) : (mode === 'manual' ? 0.8 : Math.max(width / imageObj.width, height / imageObj.height));
    const finalScale = baseScale * (zoom / 100);
    const drawW = imageObj.width * finalScale;
    const drawH = imageObj.height * finalScale;
    
    const scaleFactor = isExport ? 1080 / 450 : 1;
    const centerX = width / 2 + position.x * scaleFactor;
    const centerY = height / 2 + position.y * scaleFactor;

    ctx.drawImage(imageObj, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    ctx.restore();
  }, [imageObj, mode, blurIntensity, bgColor, zoom, position, isCircleMode]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (canvas && imageObj) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawWorkspace(ctx, canvas.width, canvas.height);
    }
  }, [drawWorkspace, imageObj, mode, blurIntensity, bgColor, zoom, position, isCircleMode]);

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
    // Download always draws the full square composition
    drawWorkspace(ctx, 1080, 1080, true, true);
    const link = document.createElement('a');
    link.download = 'whatsapp-hd-dp.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    toast({ title: 'Success!', description: 'Your HD Profile Picture has been saved.' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCircleMode) return; // Dragging only in circle/edit mode
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
    <div className="max-w-6xl mx-auto w-full px-4">
      <Card className="workspace-shadow border-none bg-white overflow-hidden rounded-3xl">
        {!image ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="p-16 md:p-32 flex flex-col items-center justify-center text-center cursor-pointer bg-secondary/10 hover:bg-primary/5 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-primary/5 group-hover:scale-110 transition-transform">
              <Upload className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-3xl font-headline font-bold mb-4 text-[#111B21]">Create your Full DP</h3>
            <p className="text-muted-foreground mb-8 max-w-sm text-lg font-medium">
              Drag and drop your photo here, or click to browse.
            </p>
            <Button size="lg" className="rounded-full px-12 h-14 text-lg font-bold bg-primary hover:bg-[#128C7E] text-white shadow-lg shadow-primary/20">Select Photo</Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            <div className="flex-grow p-6 md:p-12 bg-[#F0F2F5] flex flex-col items-center justify-center relative min-h-[500px]">
              {/* Preview Toggle Button */}
              <div className="absolute top-6 left-6 z-10">
                <Button 
                  onClick={() => setIsCircleMode(!isCircleMode)}
                  className={cn(
                    "rounded-full px-6 py-6 h-auto font-bold text-base shadow-lg transition-all flex items-center gap-2",
                    isCircleMode 
                      ? "bg-white text-primary border-2 border-primary hover:bg-primary/5" 
                      : "bg-primary text-white hover:bg-[#128C7E]"
                  )}
                >
                  {isCircleMode ? (
                    <><Layout className="w-5 h-5" /> Switch to Rectangular View</>
                  ) : (
                    <><Circle className="w-5 h-5" /> Show WhatsApp DP Preview</>
                  )}
                </Button>
              </div>

              {/* Preview Canvas Container */}
              <div 
                className={cn(
                  "relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white shadow-2xl overflow-hidden transition-all duration-500 border-4 border-white",
                  isCircleMode ? "rounded-full cursor-move circle-mask" : "rounded-2xl cursor-default"
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas ref={previewCanvasRef} width={450} height={450} className="w-full h-full" />
              </div>

              <div className="absolute top-6 right-6 flex gap-3">
                <Button variant="outline" size="icon" onClick={() => { setImage(null); setProcessedImage(null); }} className="rounded-full bg-white/80 backdrop-blur-sm border-none shadow-lg text-destructive hover:bg-destructive/10">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mt-8 flex flex-col items-center gap-2">
                <p className="px-6 py-2 bg-white/70 backdrop-blur-sm rounded-full text-xs text-[#111B21] font-bold uppercase tracking-widest">
                  {isCircleMode ? "WhatsApp Profile Preview • Drag to Adjust" : "Original Photo View"}
                </p>
                {isCircleMode && (
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
                    The circle shows how your DP will appear
                  </p>
                )}
              </div>
            </div>

            <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l p-8 flex flex-col gap-10 bg-white">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 text-primary" /> DP Style Configuration
                </h4>
                <Tabs value={mode} onValueChange={(v) => { setMode(v as EditMode); setIsCircleMode(true); }} className="w-full">
                  <TabsList className="grid grid-cols-2 gap-3 bg-transparent h-auto p-0">
                    <TabsTrigger value="blur" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary py-4 flex flex-col gap-2 rounded-2xl border-2 bg-secondary/10 text-muted-foreground transition-all">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-[11px] font-bold">Crop with Blur</span>
                    </TabsTrigger>
                    <TabsTrigger value="solid" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary py-4 flex flex-col gap-2 rounded-2xl border-2 bg-secondary/10 text-muted-foreground transition-all">
                      <Palette className="w-5 h-5" />
                      <span className="text-[11px] font-bold">Crop with Color</span>
                    </TabsTrigger>
                    <TabsTrigger value="fit" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary py-4 flex flex-col gap-2 rounded-2xl border-2 bg-secondary/10 text-muted-foreground transition-all">
                      <Maximize className="w-5 h-5" />
                      <span className="text-[11px] font-bold">Crop by Resizing</span>
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary py-4 flex flex-col gap-2 rounded-2xl border-2 bg-secondary/10 text-muted-foreground transition-all">
                      <Circle className="w-5 h-5" />
                      <span className="text-[11px] font-bold">Square Frame</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {mode === 'blur' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#111B21]">Blur Intensity</label>
                    <span className="text-sm font-mono font-bold text-primary">{blurIntensity}%</span>
                  </div>
                  <Slider value={[blurIntensity]} onValueChange={([v]) => { setBlurIntensity(v); setIsCircleMode(true); }} max={100} className="py-2" />
                  <Button variant="outline" className="w-full gap-2 py-6 border-primary/20 text-primary hover:bg-primary/5 rounded-2xl font-bold" onClick={() => { handleAIBlur(); setIsCircleMode(true); }} disabled={isProcessing}>
                    <Sparkles className="w-4 h-4" />
                    {isProcessing ? 'Processing...' : 'AI Smart Fill (Recommended)'}
                  </Button>
                </div>
              )}

              {mode === 'solid' && (
                <div className="space-y-4">
                  <label className="text-sm font-bold text-[#111B21]">Background Color</label>
                  <div className="flex flex-wrap gap-3">
                    {['#FFFFFF', '#F0F2F5', '#25D366', '#128C7E', '#111B21', '#E7E9ED'].map((color) => (
                      <button
                        key={color}
                        className={cn("w-10 h-10 rounded-full border-2 transition-all shadow-sm", bgColor === color ? "border-primary scale-110 ring-4 ring-primary/10" : "border-white")}
                        style={{ backgroundColor: color }}
                        onClick={() => { setBgColor(color); setIsCircleMode(true); }}
                      />
                    ))}
                    <div className="relative">
                      <input type="color" value={bgColor} onChange={(e) => { setBgColor(e.target.value); setIsCircleMode(true); }} className="w-10 h-10 rounded-full border-none p-0 overflow-hidden cursor-pointer opacity-0 absolute inset-0" />
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center bg-secondary/20">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ZoomIn className="w-4 h-4 text-primary" />
                    <label className="text-sm font-bold text-[#111B21]">Zoom Level</label>
                  </div>
                  <span className="text-sm font-mono font-bold text-primary">{zoom}%</span>
                </div>
                <Slider value={[zoom]} onValueChange={([v]) => { setZoom(v); setIsCircleMode(true); }} min={10} max={400} className="py-2" />
                <div className="flex gap-4">
                  <Button variant="secondary" className="flex-1 rounded-xl bg-secondary/50" onClick={() => { setZoom(Math.max(10, zoom - 20)); setIsCircleMode(true); }}><ZoomOut className="w-4 h-4 mr-2" /> Out</Button>
                  <Button variant="secondary" className="flex-1 rounded-xl bg-secondary/50" onClick={() => { setZoom(Math.min(400, zoom + 20)); setIsCircleMode(true); }}><ZoomIn className="w-4 h-4 mr-2" /> In</Button>
                </div>
              </div>

              <div className="mt-auto pt-6 flex flex-col gap-4">
                <Button variant="outline" className="w-full gap-2 py-7 border-primary/20 text-[#128C7E] hover:bg-[#128C7E]/5 rounded-2xl font-bold text-base transition-all" onClick={handleEnhance} disabled={isProcessing}>
                  <Sparkles className="w-5 h-5" />
                  {isProcessing ? 'Enhancing to HD...' : 'AI HD Enhancement'}
                </Button>
                <Button className="w-full gap-3 py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all bg-primary hover:bg-[#128C7E] text-white" onClick={handleDownload} disabled={isProcessing || !imageObj}>
                  <Download className="w-6 h-6" />
                  Download 1080px HD
                </Button>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    High Quality • No Watermark
                  </p>
                  <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                    Exported at high-resolution 1080 x 1080
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
