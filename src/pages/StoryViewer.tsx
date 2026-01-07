import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoryBySlug } from "@/hooks/useWebStories";

export default function StoryViewer() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading, error } = useStoryBySlug(slug || "");
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const slides = story?.slides || [];
  const currentSlideData = slides[currentSlide];
  const duration = (currentSlideData?.duration_seconds || 5) * 1000;

  const goToNextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setProgress(0);
    } else {
      navigate(-1);
    }
  }, [currentSlide, slides.length, navigate]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentSlide]);

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
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress bars */}
      <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 p-2">
        {slides.map((_, index) => (
          <div key={index} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width:
                  index < currentSlide
                    ? "100%"
                    : index === currentSlide
                    ? `${progress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header controls */}
      <div className="absolute left-0 right-0 top-4 z-20 flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
          style={{
            backgroundColor: currentSlideData?.background_color || "#000",
          }}
        >
          {currentSlideData?.background_image_url && (
            <img
              src={currentSlideData.background_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-24 flex flex-col items-center justify-center px-6">
            {currentSlideData?.content_html && (
              <div
                className="text-center"
                dangerouslySetInnerHTML={{ __html: currentSlideData.content_html }}
              />
            )}
          </div>

          {/* CTA Button */}
          {currentSlideData?.cta_text && currentSlideData?.cta_url && (
            <div className="absolute inset-x-0 bottom-8 flex justify-center px-6">
              <a
                href={currentSlideData.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105"
              >
                {currentSlideData.cta_text}
              </a>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation areas */}
      <button
        onClick={goToPrevSlide}
        className="absolute bottom-0 left-0 top-16 z-10 w-1/3 cursor-pointer focus:outline-none"
        aria-label="Slide anterior"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 opacity-0 transition-opacity hover:opacity-100">
          <ChevronLeft className="h-6 w-6 text-white" />
        </div>
      </button>
      <button
        onClick={() => setIsPaused((p) => !p)}
        className="absolute bottom-0 left-1/3 right-1/3 top-16 z-10 cursor-pointer focus:outline-none"
        aria-label={isPaused ? "Reproduzir" : "Pausar"}
      />
      <button
        onClick={goToNextSlide}
        className="absolute bottom-0 right-0 top-16 z-10 w-1/3 cursor-pointer focus:outline-none"
        aria-label="Próximo slide"
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 opacity-0 transition-opacity hover:opacity-100">
          <ChevronRight className="h-6 w-6 text-white" />
        </div>
      </button>
    </div>
  );
}
