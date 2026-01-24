import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function CopyButton({ value, label = "Copiar", size = "sm", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copiado para a área de transferência");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleCopy}
      className={cn("gap-2", className)}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {size !== "icon" && (copied ? "Copiado!" : label)}
    </Button>
  );
}
