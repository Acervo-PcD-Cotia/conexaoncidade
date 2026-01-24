import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageCircle, Youtube, Facebook } from "lucide-react";

interface CommentHighlightOverlayProps {
  author: string;
  message: string;
  platform?: 'youtube' | 'facebook' | 'internal';
  avatarUrl?: string;
}

const platformConfig = {
  youtube: {
    icon: Youtube,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  facebook: {
    icon: Facebook,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  internal: {
    icon: MessageCircle,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
};

export function CommentHighlightOverlay({ 
  author, 
  message,
  platform = 'internal',
  avatarUrl
}: CommentHighlightOverlayProps) {
  const config = platformConfig[platform];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.95 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      className="absolute bottom-24 left-8 right-8 z-30 pointer-events-none"
    >
      <div className={cn(
        "bg-zinc-900/95 backdrop-blur-md rounded-xl border p-4 shadow-2xl max-w-lg",
        config.border
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={author}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold",
              config.bg
            )}>
              {author.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <IconComponent className={cn("h-4 w-4", config.color)} />
              <span className="font-semibold text-white">{author}</span>
            </div>
            <span className="text-xs text-zinc-500">Comentário destacado</span>
          </div>
        </div>
        
        {/* Message */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white text-lg leading-relaxed"
        >
          "{message}"
        </motion.p>
      </div>
    </motion.div>
  );
}
