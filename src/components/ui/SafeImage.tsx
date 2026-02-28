import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  width?: number | string;
  height?: number | string;
}

export function SafeImage({ 
  src, 
  alt, 
  fallback = "/placeholder.svg", 
  className,
  loading = 'lazy',
  fetchPriority = 'auto',
  width,
  height,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn(className)}
      loading={loading}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      decoding="async"
      onError={handleError}
    />
  );
}
