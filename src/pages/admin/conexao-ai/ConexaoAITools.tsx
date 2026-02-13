import { useState } from "react";
import { ArrowLeft, Lightbulb, ClipboardCheck, Search, FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIToolCard } from "@/components/conexao-ai/AIToolCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const tools = [
  {
    id: "generate-topics",
    name: "Gerador de Pautas",
    description: "Sugere temas de notícias locais baseado em cidade, bairro ou categoria",
    icon: Lightbulb,
    category: "content",
  },
  {
    id: "partner-quiz",
    name: "Quiz do Parceiro",
    description: "Analisa o negócio e gera recomendações personalizadas de visibilidade",
    icon: ClipboardCheck,
    category: "partner",
  },
  {
    id: "google-checklist",
    name: "Checklist Google",
    description: "Verificação de presença digital com tarefas para aparecer no Google",
    icon: Search,
    category: "partner",
  },
  {
    id: "pcd-form",
    name: "Formulário PcD",
    description: "Cadastro assistido de serviços para pessoas com deficiência",
    icon: FileText,
    category: "pcd",
  },
  {
    id: "content-opportunities",
    name: "Oportunidades de Conteúdo",
    description: "Identifica lacunas e tendências para criar conteúdo relevante",
    icon: MapPin,
    category: "analytics",
  },
];

export default function ConexaoAITools() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState<typeof tools[0] | null>(null);
  const [toolInput, setToolInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolResult, setToolResult] = useState<unknown>(null);

  const handleToolClick = (tool: typeof tools[0]) => {
    setSelectedTool(tool);
    setToolInput("");
    setToolResult(null);
  };

  const handleRunTool = async () => {
    if (!selectedTool || !toolInput.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Preencha as informações necessárias.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("conexao-ai-tools", {
        body: {
          tool: selectedTool.id,
          input: toolInput.trim(),
        },
      });

      if (error) throw error;

      setToolResult(data.result);
      toast({
        title: "Processado com sucesso!",
        description: "Veja os resultados abaixo.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getInputPlaceholder = () => {
    switch (selectedTool?.id) {
      case "generate-topics":
        return "Ex: São Paulo, bairro Vila Mariana, foco em economia local";
      case "partner-quiz":
        return "Descreva o negócio: nome, categoria, localização, tempo de mercado...";
      case "google-checklist":
        return "Informe o nome do negócio e endereço completo";
      case "pcd-form":
        return "Descreva o serviço, tipo de acessibilidade e público-alvo";
      case "content-opportunities":
        return "Informe a região ou categoria para analisar oportunidades";
      default:
        return "Digite as informações necessárias...";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/spah/painel/conexao-ai")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Ferramentas Inteligentes</h1>
          <p className="text-sm text-muted-foreground">
            Utilitários de IA para acelerar tarefas do portal
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <AIToolCard
            key={tool.id}
            {...tool}
            onClick={() => handleToolClick(tool)}
          />
        ))}
      </div>

      {/* Tool dialog */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTool && <selectedTool.icon className="h-5 w-5" />}
              {selectedTool?.name}
            </DialogTitle>
            <DialogDescription>{selectedTool?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Input */}
            <div className="space-y-2">
              <Label>Informações de entrada</Label>
              <Textarea
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                placeholder={getInputPlaceholder()}
                className="min-h-[100px]"
              />
            </div>

            {/* Run button */}
            <Button
              onClick={handleRunTool}
              disabled={isProcessing || !toolInput.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Executar"
              )}
            </Button>

            {/* Results */}
            {toolResult && (
              <div className="space-y-2">
                <Label>Resultado</Label>
                <ScrollArea className="h-[300px] rounded-md border bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {typeof toolResult === "string"
                      ? toolResult
                      : JSON.stringify(toolResult, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
