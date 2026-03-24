import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  error?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxImages = 5,
  label = 'Images',
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files).slice(0, maxImages - value.length);
    const imageUrls = newImages.map((file) => URL.createObjectURL(file));

    // TODO: Upload to server and get actual URLs
    onChange([...value, ...imageUrls]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border"
            >
              <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {value.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/10'
              : error
                ? 'border-destructive bg-destructive/10'
                : 'border-border hover:border-muted-foreground bg-card/50'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <div className="flex flex-col items-center gap-2">
            {value.length === 0 ? (
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isDragging ? 'Deposez les images ici' : 'Cliquez ou glissez les images ici'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG jusqu'a 5MB ({value.length}/{maxImages} images)
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
};
