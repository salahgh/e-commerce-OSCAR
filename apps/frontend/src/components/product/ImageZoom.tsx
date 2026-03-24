'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ZoomIn, ZoomOut, X, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || !isZoomed) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPosition({ x, y });
    },
    [isZoomed]
  );

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setPosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden cursor-zoom-in group',
        isZoomed && 'cursor-zoom-out',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-transform duration-200',
          isZoomed && 'scale-150'
        )}
        style={
          isZoomed
            ? {
                transformOrigin: `${position.x}% ${position.y}%`,
              }
            : undefined
        }
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
      />

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ZoomIn className="h-4 w-4 text-foreground" />
      </div>
    </div>
  );
}

// Full screen image viewer
interface ImageLightboxProps {
  images: Array<{ src: string; alt: string }>;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          break;
        case 'ArrowRight':
          setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          break;
        case '+':
        case '=':
          setZoomLevel((prev) => Math.min(prev + 0.5, 3));
          break;
        case '-':
          setZoomLevel((prev) => Math.max(prev - 0.5, 1));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors z-10"
        aria-label="Fermer"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Zoom controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <button
          onClick={() => setZoomLevel((prev) => Math.max(prev - 0.5, 1))}
          disabled={zoomLevel <= 1}
          className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors disabled:opacity-50"
          aria-label="Zoom arriere"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <span className="px-3 py-2 text-white/80 bg-white/10 rounded-full text-sm">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel((prev) => Math.min(prev + 0.5, 3))}
          disabled={zoomLevel >= 3}
          className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors disabled:opacity-50"
          aria-label="Zoom avant"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
      </div>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 text-white/80 bg-white/10 rounded-full text-sm z-10">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
            aria-label="Image precedente"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
            aria-label="Image suivante"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Main image */}
      <div
        className="relative w-full h-full max-w-5xl max-h-[80vh] m-8 overflow-hidden"
        style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          className="object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
          sizes="100vw"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                index === currentIndex
                  ? 'border-white opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Trigger button for lightbox
interface ImageZoomTriggerProps {
  onClick: () => void;
  className?: string;
}

export function ImageZoomTrigger({ onClick, className }: ImageZoomTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full',
        'opacity-0 group-hover:opacity-100 transition-opacity',
        'hover:bg-background',
        className
      )}
      aria-label="Agrandir l'image"
    >
      <Maximize2 className="h-4 w-4" />
    </button>
  );
}
