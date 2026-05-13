
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Download, Sparkles, ImageIcon, Palette, Maximize, MousePointer2, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [blurIntensity, setBlurIntensity] = useState(25);
  const [bgColor, setBgColor] = useState('#111613');
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGuide, setShowGuide] = useState(true);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load image object when image data changes
  useEffect(() => {
    if (image || processedImage) {
      const img = new Image();
      img.src = processedImage || image || '';
      img.onload = () => setImageObj(img);
    } else {
      setImageObj(null);
    }
  }, [image, processedImage]);

  // Handle file upload
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

  const drawWorkspace = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, isExport: boolean = false) => {
    if (!imageObj) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    if (mode === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    } else if (mode === 'blur' || mode === 'fit') {
      // Draw blurred background
      ctx.save();
      if (mode === 'blur') {
        ctx.filter = `blur(${isExport ? blurIntensity * 1.5 : blurIntensity}px)`;
      }
      
      // Background should always cover the square
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

    // 2. Draw Main Image with Zoom and Pan
    ctx.save();
    
    // Scale factor based on user zoom and workspace size
    const baseScale = mode === 'fit' ? Math.min(width / imageObj.width, height / imageObj.height) : Math.max(width / imageObj.width, height / imageObj.height);
    const finalScale = baseScale * (zoom / 100);
    
    const drawW = imageObj.width * finalScale;
    const drawH = imageObj.height * finalScale;
    
    // Position handling
    // Coordinates are relative to center of workspace
    const centerX = width / 2 + (position.x * (isExport ? 1080 / 450 : 1));
    const centerY = height / 2 + (position.y * (isExport ? 1080 / 450 : 1));

    ctx.drawImage(
      imageObj,
      centerX - drawW / 2,
      centerY - drawH / 2,
      drawW,
      drawH
    );
    
    ctx.restore();
  }, [imageObj, mode, blurIntensity, bgColor, zoom, position]);

  // Update preview canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (canvas && imageObj) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawWorkspace(ctx, canvas.width, canvas.height);
      }
    }
  }, [drawWorkspace, imageObj, mode, blurIntensity, bgColor, zoom, position]);

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
    if (!imageObj) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWorkspace(ctx, 1080, 1080, true);
    
    const link = document.createElement('a');
    link.download = 'whatscrop-hd-dp.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    
    toast({ title: 'Downloaded!', description: 'Your HD Profile Picture is ready.' });
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
            <div className="flex-grow p-4 md:p-8 bg-black/40 flex items-center justify-center relative min-h-[450px]">
              <div 
                className={cn(
                  "relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-secondary shadow-2xl overflow-hidden cursor-move rounded-xl",
                  showGuide && "circle-mask"
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas 
                  ref={previewCanvasRef}
                  width={450}
                  height={450}
                  className="w-full h-full"
                />
              </div>

              {/* Action Floating Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setShowGuide(!showGuide)}
                  className="rounded-full bg-background/50 backdrop-blur-sm border-none"
                >
                  {showGuide ? 'Hide Guide' : 'Show Guide'}
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => {
                    setImage(null);
                    setProcessedImage(null);
                    setImageObj(null);
                  }}
                  className="rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50 font-medium">
                Drag to position • Scroll or use slider to zoom
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l p-6 flex flex-col gap-8 bg-card">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Background Style</h4>
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
                    <div className="relative">
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-full border-none p-0 overflow-hidden cursor-pointer opacity-0 absolute inset-0"
                      />
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center">
                        <Palette className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Image Zoom</label>
                  </div>
                  <span className="text-xs font-mono text-primary">{zoom}%</span>
                </div>
                <Slider 
                  value={[zoom]} 
                  onValueChange={([v]) => setZoom(v)} 
                  min={10} 
                  max={400} 
                />
                <div className="flex justify-between">
                  <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(10, zoom - 10))} className="h-8 w-8">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(400, zoom + 10))} className="h-8 w-8">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-auto pt-6 flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 py-6 border-accent/20 text-accent hover:bg-accent/10 transition-all hover:scale-[1.02]"
                  onClick={handleEnhance}
                  disabled={isProcessing}
                >
                  <Sparkles className="w-4 h-4" />
                  {isProcessing ? 'Processing AI...' : 'AI HD Enhancement'}
                </Button>
                <Button 
                  className="w-full gap-2 py-7 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  onClick={handleDownload}
                  disabled={isProcessing || !imageObj}
                >
                  <Download className="w-5 h-5" />
                  Download 1080x1080 HD
                </Button>
                <p className="text-[10px] text-center text-muted-foreground font-medium flex items-center justify-center gap-1">
                  <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  Processed locally. No watermark. No data storage.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
