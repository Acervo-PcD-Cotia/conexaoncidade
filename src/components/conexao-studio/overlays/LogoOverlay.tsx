import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoOverlayProps {
  imageUrl: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md' | 'lg';
  opacity?: number;
}

const positionClasses = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

const sizeClasses = {
  sm: 'h-8 w-auto max-w-[80px]',
  md: 'h-12 w-auto max-w-[120px]',
  lg: 'h-16 w-auto max-w-[160px]',
};

export function LogoOverlay({ 
  imageUrl, 
  position, 
  size = 'md',
  opacity = 1 
}: LogoOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "absolute z-30 pointer-events-none",
        positionClasses[position]
      )}
      style={{ opacity }}
    >
      <img 
        src={imageUrl} 
        alt="Logo"
        className={cn(
          "object-contain drop-shadow-lg",
          sizeClasses[size]
        )}
      />
    </motion.div>
  );
}
