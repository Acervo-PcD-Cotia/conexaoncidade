import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  Eye,
  Moon,
  Hand,
  BookOpen,
  RotateCcw,
  X,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting, resetSettings, increaseFontSize, decreaseFontSize } = useAccessibility();

  const controls = [
    {
      id: "font-decrease",
      label: "Diminuir fonte",
      icon: ZoomOut,
      action: decreaseFontSize,
      active: settings.fontSize !== "normal",
    },
    {
      id: "font-increase",
      label: "Aumentar fonte",
      icon: ZoomIn,
      action: increaseFontSize,
      active: settings.fontSize !== "normal",
    },
    {
      id: "high-contrast",
      label: "Alto contraste",
      icon: Eye,
      action: () => updateSetting("highContrast", !settings.highContrast),
      active: settings.highContrast,
    },
    {
      id: "reduced-motion",
      label: "Pausar animações",
      icon: Moon,
      action: () => updateSetting("reducedMotion", !settings.reducedMotion),
      active: settings.reducedMotion,
    },
    {
      id: "reading-mode",
      label: "Modo leitura",
      icon: BookOpen,
      action: () => updateSetting("readingMode", !settings.readingMode),
      active: settings.readingMode,
    },
    {
      id: "vlibras",
      label: "VLibras",
      icon: Hand,
      action: () => updateSetting("vlibrasActive", !settings.vlibrasActive),
      active: settings.vlibrasActive,
    },
  ];

  return (
    <>
      {/* Floating button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir painel de acessibilidade"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Accessibility className="h-6 w-6" />
          )}
        </Button>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-72 rounded-xl bg-card border border-border shadow-2xl"
            role="dialog"
            aria-label="Painel de acessibilidade"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-bold text-sm">Acessibilidade</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSettings}
                className="h-8 text-xs gap-1"
                aria-label="Restaurar configurações padrão"
              >
                <RotateCcw className="h-3 w-3" />
                Restaurar
              </Button>
            </div>

            {/* Controls grid */}
            <div className="grid grid-cols-2 gap-2 p-3">
              {controls.map((control) => (
                <button
                  key={control.id}
                  onClick={control.action}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg p-3 transition-colors",
                    "border border-border hover:border-primary/50",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    control.active && "bg-primary/10 border-primary text-primary"
                  )}
                  aria-pressed={control.active}
                  aria-label={control.label}
                >
                  <control.icon className={cn("h-5 w-5", control.active && "text-primary")} />
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {control.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Font size indicator */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tamanho da fonte</span>
                <span className="font-medium capitalize">{settings.fontSize === "normal" ? "Normal" : settings.fontSize === "large" ? "Grande" : "Extra grande"}</span>
              </div>
            </div>

            {/* Quick TTS button */}
            <div className="border-t border-border p-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  // Use Web Speech API for quick TTS
                  const utterance = new SpeechSynthesisUtterance(
                    "Central de acessibilidade ativada. Use os controles para personalizar sua experiência."
                  );
                  utterance.lang = "pt-BR";
                  speechSynthesis.speak(utterance);
                }}
                aria-label="Ouvir instruções de acessibilidade"
              >
                <Volume2 className="h-4 w-4" />
                Ouvir instruções
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
