import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyToClipboardButtonProps {
  text: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export default function CopyToClipboardButton({
  text,
  label = "Copiar",
  className,
  variant = "outline",
  size = "sm",
  disabled = false,
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text || disabled) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copiado para a área de transferência!");
      
      // Reset após 2 segundos
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast.error("Erro ao copiar texto");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={disabled || !text}
      className={cn(
        "gap-2 transition-all",
        copied && "bg-green-100 text-green-700 border-green-300",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
