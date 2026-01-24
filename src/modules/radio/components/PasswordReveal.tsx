import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

interface PasswordRevealProps {
  maskedValue: string;
  revealedValue: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  onReveal: () => void;
  onHide: () => void;
  className?: string;
}

export function PasswordReveal({
  maskedValue,
  revealedValue,
  expiresAt,
  isLoading,
  onReveal,
  onHide,
  className,
}: PasswordRevealProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setCountdown(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isRevealed = !!revealedValue;
  const displayValue = isRevealed ? revealedValue : maskedValue;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        type={isRevealed ? "text" : "password"}
        value={displayValue}
        readOnly
        className="font-mono text-sm"
      />
      
      {isRevealed ? (
        <>
          <CopyButton value={revealedValue} size="icon" label="" />
          <Button
            variant="outline"
            size="icon"
            onClick={onHide}
            title="Ocultar"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
          {countdown !== null && countdown > 0 && (
            <span className="text-xs text-muted-foreground min-w-[2rem]">
              {countdown}s
            </span>
          )}
        </>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={onReveal}
          disabled={isLoading}
          title="Revelar por 15 segundos"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
