import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LowerThirdProps {
  name: string;
  title?: string;
  isVisible: boolean;
  position?: "bottom-left" | "bottom-center" | "bottom-right";
  variant?: "default" | "modern" | "minimal" | "breaking";
  className?: string;
}

export function LowerThird({
  name,
  title,
  isVisible,
  position = "bottom-left",
  variant = "default",
  className,
}: LowerThirdProps) {
  const positionClasses = {
    "bottom-left": "left-4 bottom-16",
    "bottom-center": "left-1/2 -translate-x-1/2 bottom-16",
    "bottom-right": "right-4 bottom-16",
  };

  const variants = {
    default: {
      container: "bg-gradient-to-r from-primary to-primary/80",
      name: "text-primary-foreground",
      title: "text-primary-foreground/80",
      accent: "bg-primary-foreground/20",
    },
    modern: {
      container: "bg-black/80 backdrop-blur-md",
      name: "text-white",
      title: "text-white/70",
      accent: "bg-primary",
    },
    minimal: {
      container: "bg-white/90 backdrop-blur-sm",
      name: "text-gray-900",
      title: "text-gray-600",
      accent: "bg-primary",
    },
    breaking: {
      container: "bg-red-600",
      name: "text-white font-bold",
      title: "text-white/90",
      accent: "bg-yellow-400",
    },
  };

  const style = variants[variant];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={cn(
            "absolute z-50",
            positionClasses[position],
            className
          )}
        >
          <div className={cn("flex items-stretch rounded-md overflow-hidden shadow-lg", style.container)}>
            {/* Accent bar */}
            <div className={cn("w-1", style.accent)} />
            
            {/* Content */}
            <div className="px-4 py-2 flex flex-col justify-center">
              <motion.span
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={cn("text-lg font-semibold leading-tight", style.name)}
              >
                {name}
              </motion.span>
              
              {title && (
                <motion.span
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={cn("text-sm leading-tight", style.title)}
                >
                  {title}
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LowerThirdBreakingProps {
  headline: string;
  isVisible: boolean;
  className?: string;
}

export function LowerThirdBreaking({
  headline,
  isVisible,
  className,
}: LowerThirdBreakingProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className={cn(
            "absolute bottom-0 left-0 right-0 z-50",
            className
          )}
        >
          <div className="bg-red-600 py-3">
            <div className="flex items-center gap-4 px-4">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="bg-white text-red-600 px-2 py-0.5 text-xs font-bold uppercase rounded"
              >
                Urgente
              </motion.span>
              <span className="text-white font-medium truncate">
                {headline}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LowerThirdTickerProps {
  items: string[];
  isVisible: boolean;
  speed?: number;
  className?: string;
}

export function LowerThirdTicker({
  items,
  isVisible,
  speed = 50,
  className,
}: LowerThirdTickerProps) {
  const text = items.join(" • ");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className={cn(
            "absolute bottom-0 left-0 right-0 z-40 overflow-hidden",
            className
          )}
        >
          <div className="bg-black/80 backdrop-blur-sm py-2">
            <motion.div
              animate={{ x: [0, -500] }}
              transition={{
                repeat: Infinity,
                duration: text.length / speed,
                ease: "linear",
              }}
              className="whitespace-nowrap"
            >
              <span className="text-white text-sm">
                {text} • {text}
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
