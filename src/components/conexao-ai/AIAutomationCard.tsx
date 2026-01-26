import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  ClipboardCheck, 
  FileText, 
  Radio,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConexaoAIAutomation } from "@/types/conexao-ai";

interface AIAutomationCardProps {
  automation: ConexaoAIAutomation;
  onToggle: (isActive: boolean) => void;
  isToggling?: boolean;
}

const triggerIcons: Record<string, LucideIcon> = {
  news_created: FileText,
  partner_registered: ClipboardCheck,
  event_created: Share2,
  broadcast_activated: Radio,
};

const triggerLabels: Record<string, string> = {
  news_created: "Notícia publicada",
  partner_registered: "Parceiro cadastrado",
  event_created: "Evento criado",
  broadcast_activated: "Rádio/TV ativada",
};

const actionLabels: Record<string, string> = {
  suggest_share: "Sugerir divulgação",
  generate_checklist: "Gerar checklist",
  create_social_post: "Criar post social",
  generate_instructions: "Gerar instruções",
};

export function AIAutomationCard({
  automation,
  onToggle,
  isToggling = false,
}: AIAutomationCardProps) {
  const Icon = triggerIcons[automation.trigger_event] || FileText;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors",
        automation.is_active ? "border-primary/20" : "border-border"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          automation.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium">{automation.name}</h3>
            {automation.description && (
              <p className="text-sm text-muted-foreground">
                {automation.description}
              </p>
            )}
          </div>
          <Switch
            checked={automation.is_active}
            onCheckedChange={onToggle}
            disabled={isToggling}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Gatilho: {triggerLabels[automation.trigger_event] || automation.trigger_event}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Ação: {actionLabels[automation.action_type] || automation.action_type}
          </Badge>
        </div>
      </div>
    </div>
  );
}
