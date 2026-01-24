import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LowerThirdOverlayProps {
  name: string;
  title?: string;
  position?: 'left' | 'center' | 'right';
  variant?: 'default' | 'minimal' | 'accent';
}

const positionClasses = {
  left: 'left-8',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-8',
};

export function LowerThirdOverlay({ 
  name, 
  title,
  position = 'left',
  variant = 'default'
}: LowerThirdOverlayProps) {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={cn(
        "absolute bottom-20 z-30 pointer-events-none",
        positionClasses[position]
      )}
    >
      <div className={cn(
        "relative overflow-hidden rounded-r-lg shadow-2xl",
        variant === 'minimal' && "bg-black/70 backdrop-blur-sm",
        variant === 'accent' && "bg-gradient-to-r from-primary to-primary/80",
        variant === 'default' && "bg-gradient-to-r from-zinc-900/95 to-zinc-800/90 backdrop-blur-sm"
      )}>
        {/* Accent bar */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          variant === 'accent' ? "bg-white" : "bg-primary"
        )} />
        
        <div className="px-6 py-3 pl-4">
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "font-bold text-lg tracking-wide",
              variant === 'accent' ? "text-white" : "text-white"
            )}
          >
            {name}
          </motion.p>
          
          {title && (
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "text-sm",
                variant === 'accent' ? "text-white/80" : "text-zinc-400"
              )}
            >
              {title}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
