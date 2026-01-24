import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Bell, Zap } from "lucide-react";

interface BannerOverlayProps {
  text: string;
  position?: 'top' | 'center' | 'bottom';
  variant?: 'default' | 'alert' | 'info' | 'promo';
}

const positionClasses = {
  top: 'top-16',
  center: 'top-1/2 -translate-y-1/2',
  bottom: 'bottom-24',
};

const variantConfig = {
  default: {
    bg: "bg-zinc-900/90",
    border: "border-zinc-700",
    text: "text-white",
    icon: null,
  },
  alert: {
    bg: "bg-red-600/90",
    border: "border-red-500",
    text: "text-white",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-600/90",
    border: "border-blue-500",
    text: "text-white",
    icon: Info,
  },
  promo: {
    bg: "bg-gradient-to-r from-purple-600/90 to-pink-600/90",
    border: "border-purple-500",
    text: "text-white",
    icon: Zap,
  },
};

export function BannerOverlay({ 
  text, 
  position = 'top',
  variant = 'default'
}: BannerOverlayProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none",
        positionClasses[position]
      )}
    >
      <div className={cn(
        "px-6 py-3 rounded-lg border backdrop-blur-sm shadow-2xl flex items-center gap-3",
        config.bg,
        config.border
      )}>
        {IconComponent && (
          <IconComponent className={cn("h-5 w-5 shrink-0", config.text)} />
        )}
        <p className={cn("font-medium text-sm", config.text)}>
          {text}
        </p>
      </div>
    </motion.div>
  );
}
