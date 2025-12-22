'use client';

import React, { useState } from 'react';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Mail,
  Check,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
}

export function SocialShare({
  url,
  title,
  description,
  className,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600 hover:text-white',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-sky-500 hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-blue-700 hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-green-600 hover:text-white',
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: 'hover:bg-gray-600 hover:text-white',
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Share Button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        aria-label="Partager"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm font-medium">Partager</span>
      </button>

      {/* Share Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">
                Partager sur
              </span>
            </div>

            {/* Social Links */}
            <div className="py-1">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    link.color
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </a>
              ))}
            </div>

            {/* Copy Link */}
            <div className="border-t border-border pt-1">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Lien copie!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4" />
                    <span>Copier le lien</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Inline share buttons variant
interface InlineSocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export function InlineSocialShare({
  url,
  title,
  description,
  className,
}: InlineSocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground mr-2">Partager:</span>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full border border-border hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors"
        aria-label="Partager sur Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full border border-border hover:bg-sky-500 hover:border-sky-500 hover:text-white transition-colors"
        aria-label="Partager sur Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>

      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full border border-border hover:bg-green-600 hover:border-green-600 hover:text-white transition-colors"
        aria-label="Partager sur WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </a>

      <button
        onClick={handleCopyLink}
        className={cn(
          'p-2 rounded-full border border-border transition-colors',
          copied
            ? 'bg-green-600 border-green-600 text-white'
            : 'hover:bg-muted'
        )}
        aria-label="Copier le lien"
      >
        {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
