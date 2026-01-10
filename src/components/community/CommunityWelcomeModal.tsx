import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket, Sparkles, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SuperQuiz } from "./SuperQuiz";
import { cn } from "@/lib/utils";

interface CommunityWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteValidate: (code: string) => Promise<void>;
  onQuizComplete: () => Promise<void>;
  isValidatingInvite?: boolean;
  isCompletingQuiz?: boolean;
}

type ModalStep = "welcome" | "invite" | "quiz";

export function CommunityWelcomeModal({
  isOpen,
  onClose,
  onInviteValidate,
  onQuizComplete,
  isValidatingInvite,
  isCompletingQuiz,
}: CommunityWelcomeModalProps) {
  const [step, setStep] = useState<ModalStep>("welcome");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const handleValidateInvite = async () => {
    if (!inviteCode.trim()) return;
    setInviteError(null);
    try {
      await onInviteValidate(inviteCode.trim());
    } catch (error) {
      setInviteError(
        error instanceof Error
          ? error.message
          : "Código inválido. Verifique e tente novamente."
      );
    }
  };

  const handleQuizComplete = async () => {
    await onQuizComplete();
  };

  const handleBack = () => {
    setStep("welcome");
    setInviteError(null);
    setInviteCode("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Fechar"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="h-full overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <AnimatePresence mode="wait">
                {step === "welcome" && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Header */}
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                        <Heart className="h-8 w-8 text-primary" />
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold">
                        Bem-vinda(o) à Comunidade Conexão na Cidade
                      </h1>
                      <p className="text-muted-foreground">
                        Este é um espaço criado para pessoas que acreditam em
                        informação de qualidade, empatia, participação social e
                        inclusão.
                      </p>
                    </div>

                    {/* Intro text */}
                    <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                      <p className="text-sm">
                        Antes de entrar, queremos te convidar para uma
                        experiência rápida e especial.
                      </p>
                      <p className="text-sm">
                        Você pode acessar a comunidade de duas formas:
                      </p>
                      <ul className="text-sm space-y-1 pl-4">
                        <li>• Com um <strong>código de convite</strong></li>
                        <li>
                          • Ou respondendo um{" "}
                          <strong>Super Quiz rápido e fácil</strong>, criado
                          para pessoas incríveis como você 💙
                        </li>
                      </ul>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                      {/* Invite Code Option */}
                      <button
                        onClick={() => setStep("invite")}
                        className={cn(
                          "w-full text-left rounded-xl border-2 p-5 transition-all",
                          "hover:border-primary hover:bg-primary/5",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">
                              Entrar com Código de Convite
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Recebeu um convite? Use-o para entrar diretamente.
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Quiz Option */}
                      <button
                        onClick={() => setStep("quiz")}
                        className={cn(
                          "w-full text-left rounded-xl border-2 p-5 transition-all",
                          "hover:border-primary hover:bg-primary/5",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">
                              Super Quiz da Comunidade
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Leva menos de 1 minuto e não tem respostas certas
                              ou erradas. É apenas uma forma de nos conhecermos
                              melhor 🙂
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "invite" && (
                  <motion.div
                    key="invite"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Back button */}
                    <button
                      onClick={handleBack}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Voltar
                    </button>

                    {/* Header */}
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                        <Ticket className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Código de Convite</h2>
                      <p className="text-muted-foreground">
                        Digite o código que você recebeu de um membro da
                        comunidade.
                      </p>
                    </div>

                    {/* Input */}
                    <div className="space-y-4">
                      <Input
                        placeholder="Ex: CONEXAO2026"
                        value={inviteCode}
                        onChange={(e) => {
                          setInviteCode(e.target.value.toUpperCase());
                          setInviteError(null);
                        }}
                        className="text-center text-lg uppercase tracking-wider"
                        maxLength={15}
                      />
                      {inviteError && (
                        <p className="text-sm text-destructive text-center">
                          {inviteError}
                        </p>
                      )}
                      <Button
                        onClick={handleValidateInvite}
                        disabled={!inviteCode.trim() || isValidatingInvite}
                        className="w-full"
                        size="lg"
                      >
                        {isValidatingInvite ? "Validando..." : "Validar convite"}
                      </Button>
                    </div>

                    {/* Alternative */}
                    <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        Não tem um código?{" "}
                        <button
                          onClick={() => setStep("quiz")}
                          className="text-primary hover:underline font-medium"
                        >
                          Responda o Super Quiz
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === "quiz" && (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Back button */}
                    <button
                      onClick={handleBack}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Voltar
                    </button>

                    {/* Quiz Header */}
                    <div className="text-center space-y-2 pb-4">
                      <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Super Quiz da Comunidade
                      </h2>
                    </div>

                    {/* Quiz Component */}
                    <SuperQuiz
                      onComplete={handleQuizComplete}
                      isSubmitting={isCompletingQuiz}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}