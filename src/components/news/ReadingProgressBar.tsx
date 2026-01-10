import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ReadingProgressBarProps {
  className?: string;
  isCompleted?: boolean;
  showCompletionBadge?: boolean;
}

export function ReadingProgressBar({ 
  className, 
  isCompleted = false,
  showCompletionBadge = true 
}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight > 0) {
        const scrollProgress = (scrollTop / docHeight) * 100;
        setProgress(Math.min(100, Math.max(0, scrollProgress)));
      }
    };

    // Initial check
    updateProgress();

    // Throttle scroll events for performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 h-1 bg-muted/50 z-50",
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso de leitura"
    >
      <div
        className={cn(
          "h-full transition-all duration-100 ease-out",
          isCompleted 
            ? "bg-green-500" 
            : "bg-gradient-to-r from-primary to-primary/80"
        )}
        style={{ width: `${progress}%` }}
      />
      
      {/* Completion badge */}
      {showCompletionBadge && isCompleted && progress >= 85 && (
        <div className="absolute right-4 top-2 flex items-center gap-1.5 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg animate-in fade-in slide-in-from-right-2 duration-300">
          <Check className="w-3 h-3" />
          <span>+3 pts</span>
        </div>
      )}
    </div>
  );
}
