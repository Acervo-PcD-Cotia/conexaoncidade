import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TickerOverlayProps {
  text: string;
  speed?: 'slow' | 'normal' | 'fast';
  variant?: 'default' | 'breaking' | 'info';
}

const speedDurations = {
  slow: 30,
  normal: 20,
  fast: 12,
};

const variantStyles = {
  default: {
    bg: "bg-primary/90",
    text: "text-white",
    label: "DESTAQUE",
  },
  breaking: {
    bg: "bg-red-600",
    text: "text-white",
    label: "URGENTE",
  },
  info: {
    bg: "bg-blue-600",
    text: "text-white",
    label: "INFO",
  },
};

export function TickerOverlay({ 
  text, 
  speed = 'normal',
  variant = 'default'
}: TickerOverlayProps) {
  const style = variantStyles[variant];
  const duration = speedDurations[speed];
  
  // Duplicate text for seamless loop
  const duplicatedText = `${text}     •     ${text}     •     `;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
    >
      <div className={cn(
        "flex items-center overflow-hidden backdrop-blur-sm",
        style.bg
      )}>
        {/* Label */}
        <div className={cn(
          "shrink-0 px-4 py-2 font-bold text-sm tracking-wider",
          variant === 'breaking' ? "bg-red-700" : "bg-black/20",
          style.text
        )}>
          {style.label}
        </div>
        
        {/* Scrolling text */}
        <div className="flex-1 overflow-hidden py-2">
          <motion.div
            animate={{ x: [0, -50 + '%'] }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "linear",
            }}
            className={cn(
              "whitespace-nowrap text-sm font-medium",
              style.text
            )}
          >
            {duplicatedText}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
