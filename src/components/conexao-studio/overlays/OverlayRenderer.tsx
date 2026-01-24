import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Overlay, LowerThirdContent, TickerContent, LogoContent, CommentHighlightContent } from "@/hooks/useStudioOverlays";

interface OverlayRendererProps {
  overlays: Overlay[];
  className?: string;
}

export function OverlayRenderer({ overlays, className }: OverlayRendererProps) {
  const visibleOverlays = overlays.filter((o) => o.isVisible);

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <AnimatePresence>
        {visibleOverlays.map((overlay) => (
          <OverlayItem key={overlay.id} overlay={overlay} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function OverlayItem({ overlay }: { overlay: Overlay }) {
  switch (overlay.type) {
    case "logo":
      return <LogoOverlay overlay={overlay} />;
    case "lower-third":
      return <LowerThirdOverlay overlay={overlay} />;
    case "ticker":
      return <TickerOverlay overlay={overlay} />;
    case "banner":
      return <BannerOverlay overlay={overlay} />;
    case "comment-highlight":
      return <CommentHighlightOverlay overlay={overlay} />;
    default:
      return null;
  }
}

// Logo Overlay
function LogoOverlay({ overlay }: { overlay: Overlay }) {
  const content = overlay.content as unknown as LogoContent;
  const positionClasses = getPositionClasses(overlay.position);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: content.opacity ?? 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn("absolute p-4", positionClasses)}
    >
      <img
        src={content.imageUrl}
        alt="Logo"
        style={{
          width: content.width || "auto",
          height: content.height || 60,
          maxWidth: "200px",
        }}
        className="drop-shadow-lg"
      />
    </motion.div>
  );
}

// Lower Third Overlay
function LowerThirdOverlay({ overlay }: { overlay: Overlay }) {
  const content = overlay.content as unknown as LowerThirdContent;

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute bottom-20 left-8"
    >
      <div className="flex items-stretch">
        {/* Accent bar */}
        <div className="w-1.5 bg-primary rounded-l" />
        
        {/* Content */}
        <div className="bg-gradient-to-r from-zinc-900/95 to-zinc-900/80 backdrop-blur-sm px-5 py-3 rounded-r shadow-xl">
          <h3 className="text-white font-bold text-lg leading-tight">
            {content.name}
          </h3>
          <p className="text-primary text-sm font-medium">
            {content.title}
          </p>
          {content.subtitle && (
            <p className="text-zinc-400 text-xs mt-0.5">
              {content.subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Ticker Overlay
function TickerOverlay({ overlay }: { overlay: Overlay }) {
  const content = overlay.content as unknown as TickerContent;
  const speed = content.speed || 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute bottom-0 left-0 right-0 bg-primary/90 backdrop-blur-sm py-2 overflow-hidden"
    >
      <motion.div
        animate={{
          x: ["100%", "-100%"],
        }}
        transition={{
          x: {
            repeat: content.loop !== false ? Infinity : 0,
            repeatType: "loop",
            duration: content.text.length / (speed / 10),
            ease: "linear",
          },
        }}
        className="whitespace-nowrap"
      >
        <span className="text-primary-foreground font-medium text-sm">
          {content.text}
        </span>
      </motion.div>
    </motion.div>
  );
}

// Banner Overlay
function BannerOverlay({ overlay }: { overlay: Overlay }) {
  const content = overlay.content as { text: string; backgroundColor?: string; textColor?: string };
  const positionClasses = getPositionClasses(overlay.position);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className={cn("absolute p-4", positionClasses)}
    >
      <div
        className="px-4 py-2 rounded-lg shadow-lg"
        style={{
          backgroundColor: content.backgroundColor || "hsl(var(--primary))",
          color: content.textColor || "hsl(var(--primary-foreground))",
        }}
      >
        <span className="font-medium">{content.text}</span>
      </div>
    </motion.div>
  );
}

// Comment Highlight Overlay
function CommentHighlightOverlay({ overlay }: { overlay: Overlay }) {
  const content = overlay.content as unknown as CommentHighlightContent;

  const getPlatformColor = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case "youtube":
        return "border-red-500";
      case "facebook":
        return "border-blue-600";
      case "instagram":
        return "border-pink-500";
      case "twitch":
        return "border-purple-500";
      default:
        return "border-primary";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 20 }}
      className="absolute bottom-24 left-8 max-w-md"
    >
      <div
        className={cn(
          "bg-zinc-900/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border-l-4",
          getPlatformColor(content.platform)
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          {content.avatarUrl ? (
            <img
              src={content.avatarUrl}
              alt={content.author}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
              <span className="text-sm font-bold text-zinc-300">
                {content.author.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm">{content.author}</p>
            {content.platform && (
              <p className="text-zinc-400 text-xs">{content.platform}</p>
            )}
          </div>
        </div>

        {/* Message */}
        <p className="text-white text-lg leading-relaxed">{content.message}</p>
      </div>
    </motion.div>
  );
}

// Helper function for positioning
function getPositionClasses(position: string): string {
  switch (position) {
    case "top-left":
      return "top-0 left-0";
    case "top-right":
      return "top-0 right-0";
    case "bottom-left":
      return "bottom-0 left-0";
    case "bottom-right":
      return "bottom-0 right-0";
    case "center":
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    case "bottom":
      return "bottom-0 left-0 right-0";
    default:
      return "bottom-0 left-0";
  }
}
