import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Newspaper,
  Sparkles,
  Church,
  Radio,
  GraduationCap,
  Medal,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Info,
  FileText,
  Search,
  Video,
  Users,
  Store,
  Tag,
  Briefcase,
  Heart,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import {
  PROFILE_METADATA,
  PROFILE_DEFAULT_MODULES,
  MODULE_METADATA,
  type UserProfile,
} from "@/types/profiles-modules";

// Mapa de ícones para lookup dinâmico
const ICON_MAP: Record<string, LucideIcon> = {
  Newspaper,
  Sparkles,
  Church,
  Radio,
  GraduationCap,
  Medal,
  FileText,
  Search,
  Video,
  Users,
  Store,
  Tag,
  Briefcase,
  Heart,
  Wand2,
};

interface ProfileOnboardingModalProps {
  open: boolean;
  allowedProfiles: UserProfile[];
  onComplete: (profile: UserProfile) => Promise<void>;
}

export function ProfileOnboardingModal({
  open,
  allowedProfiles,
  onComplete,
}: ProfileOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileSelect = (profile: UserProfile) => {
    setSelectedProfile(profile);
  };

  const handleNextStep = () => {
    if (selectedProfile) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!selectedProfile) return;
    
    setIsSubmitting(true);
    try {
      await onComplete(selectedProfile);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const selectedModules = selectedProfile
    ? PROFILE_DEFAULT_MODULES[selectedProfile]
    : [];

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-2xl [&>button]:hidden">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="text-center pb-4">
                <DialogTitle className="text-2xl">
                  Como você vai usar o Conexão?
                </DialogTitle>
                <DialogDescription>
                  Escolha o perfil que melhor descreve seu uso. Você pode mudar depois.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
                {allowedProfiles.map((profileKey) => {
                  const meta = PROFILE_METADATA[profileKey];
                  const IconComponent = ICON_MAP[meta.icon];
                  const isSelected = selectedProfile === profileKey;

                  return (
                    <button
                      key={profileKey}
                      onClick={() => handleProfileSelect(profileKey)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                        "hover:shadow-md hover:scale-[1.02]",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg bg-gradient-to-br",
                            meta.gradient,
                            "text-white"
                          )}
                        >
                          {IconComponent && <IconComponent className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {meta.label}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {meta.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNextStep}
                  disabled={!selectedProfile}
                  className="min-w-[120px]"
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="text-center pb-4">
                <DialogTitle className="text-2xl">
                  Seu painel personalizado
                </DialogTitle>
                <DialogDescription>
                  Com o perfil <strong>{selectedProfile && PROFILE_METADATA[selectedProfile].label}</strong>,
                  você terá acesso a:
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedModules.map((moduleKey) => {
                    const moduleMeta = MODULE_METADATA[moduleKey];
                    const IconComponent = ICON_MAP[moduleMeta.icon];

                    return (
                      <div
                        key={moduleKey}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border"
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 text-primary" />
                        )}
                        <span className="text-sm font-medium">
                          {moduleMeta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Você pode ativar mais módulos a qualquer momento nas configurações.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ativando...
                    </>
                  ) : (
                    <>
                      Ativar meu painel
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
