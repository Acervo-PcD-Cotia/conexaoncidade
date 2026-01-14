import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useStoryBySlug, incrementStoryViewCount } from "@/hooks/useWebStories";
import { cn } from "@/lib/utils";

export default function StoryViewer() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading, error } = useStoryBySlug(slug || "");
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const slides = story?.slides || [];
  const currentSlideData = slides[currentSlide];
  const duration = (currentSlideData?.duration_seconds || 5) * 1000;
  const isLastSlide = currentSlide === slides.length - 1;

  // Track view count once
  useEffect(() => {
    if (story?.id && !hasTrackedView) {
      incrementStoryViewCount(story.id);
      setHasTrackedView(true);
    }
  }, [story?.id, hasTrackedView]);

  // Handle slide audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const slideAudio = (currentSlideData as any)?.slide_audio_url;
    if (slideAudio) {
      audioRef.current = new Audio(slideAudio);
      audioRef.current.muted = isMuted;
      if (!isPaused) {
        audioRef.current.play().catch(() => {});
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentSlide, currentSlideData]);

  // Update audio mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Pause/resume audio
  useEffect(() => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isPaused]);

  const goToNextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setProgress(0);
    } else {
      // On last slide, go back
      navigate(-1);
    }
  }, [currentSlide, slides.length, navigate]);

  const goToPrevSlide = useCallback(() => {
    if (progress > 20 && currentSlide === 0) {
      // If we're early in the first slide, just restart it
      setProgress(0);
    } else if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentSlide, progress]);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || !slides.length) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (duration / 100);
        if (newProgress >= 100) {
          goToNextSlide();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, duration, goToNextSlide, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNextSlide();
      if (e.key === "ArrowLeft") goToPrevSlide();
      if (e.key === "Escape") navigate(-1);
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, navigate]);

  // Swipe gesture handling
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      goToPrevSlide();
    } else if (info.offset.x < -threshold) {
      goToNextSlide();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (error || !story || slides.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black text-white">
        <p>Story não encontrada</p>
        <button onClick={() => navigate(-1)} className="text-primary underline">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Mobile-first 9:16 container */}
      <div className="relative w-full h-full max-w-[430px] max-h-[932px] md:h-[90vh] md:rounded-2xl md:overflow-hidden">
        {/* Progress bars */}
        <div className="absolute left-0 right-0 top-0 z-30 flex gap-1 p-3 pt-safe">
          {slides.map((_, index) => (
            <div key={index} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <motion.div
                className="h-full bg-white"
                initial={false}
                animate={{
                  width:
                    index < currentSlide
                      ? "100%"
                      : index === currentSlide
                      ? `${progress}%`
                      : "0%",
                }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          ))}
        </div>

        {/* Header controls */}
        <div className="absolute left-0 right-0 top-5 z-30 flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 active:scale-95"
              aria-label={isPaused ? "Reproduzir" : "Pausar"}
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 active:scale-95"
              aria-label={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 active:scale-95"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slide content with swipe */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 touch-pan-y"
            style={{
              backgroundColor: currentSlideData?.background_color || "#000",
            }}
          >
            {/* Background Image */}
            {currentSlideData?.background_image_url && (
              <img
                src={currentSlideData.background_image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            
            {/* Gradient overlay - stronger for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-32 flex flex-col items-center justify-center px-6">
              {/* Headline text (new field) */}
              {(currentSlideData as any)?.headline_text && (
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3 drop-shadow-lg">
                  {(currentSlideData as any).headline_text}
                </h2>
              )}
              
              {/* Subheadline text (new field) */}
              {(currentSlideData as any)?.subheadline_text && (
                <p className="text-lg text-white/90 text-center mb-4 drop-shadow-md">
                  {(currentSlideData as any).subheadline_text}
                </p>
              )}
              
              {/* HTML Content */}
              {currentSlideData?.content_html && (
                <div
                  className="text-center prose prose-invert prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentSlideData.content_html }}
                />
              )}
            </div>

            {/* CTA Button - Prominent on last slide */}
            {currentSlideData?.cta_text && currentSlideData?.cta_url && (
              <div className={cn(
                "absolute inset-x-0 bottom-10 flex justify-center px-6",
                isLastSlide && "animate-pulse"
              )}>
                <a
                  href={currentSlideData.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 rounded-full px-8 py-4 font-bold transition-all",
                    "bg-primary text-primary-foreground shadow-lg",
                    "hover:scale-105 hover:shadow-xl active:scale-95",
                    isLastSlide && "text-lg px-10 py-5"
                  )}
                >
                  {currentSlideData.cta_text}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation areas - Touch targets */}
        <button
          onClick={goToPrevSlide}
          className="absolute bottom-0 left-0 top-20 z-20 w-1/3 cursor-pointer focus:outline-none"
          aria-label="Slide anterior"
        />
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="absolute bottom-0 left-1/3 right-1/3 top-20 z-20 cursor-pointer focus:outline-none"
          aria-label={isPaused ? "Reproduzir" : "Pausar"}
        />
        <button
          onClick={goToNextSlide}
          className="absolute bottom-0 right-0 top-20 z-20 w-1/3 cursor-pointer focus:outline-none"
          aria-label="Próximo slide"
        />

        {/* Story info footer */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-safe">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">CNC</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {story.title}
              </p>
              <p className="text-xs text-white/60">
                Conexão na Cidade
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop side arrows */}
      <button
        onClick={goToPrevSlide}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNextSlide}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
