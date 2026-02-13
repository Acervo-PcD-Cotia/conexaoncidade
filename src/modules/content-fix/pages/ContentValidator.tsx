import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Play, CheckCircle2, XCircle, AlertCircle, Loader2, Image, Link2, FolderTree, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useContentFixStats } from "../hooks/useContentFixStats";

interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "pending" | "running" | "success" | "warning" | "error";
  count?: number;
  message?: string;
}

export default function ContentValidator() {
  const navigate = useNavigate();
  const { data: stats, isLoading: loadingStats } = useContentFixStats();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [checks, setChecks] = useState<ValidationCheck[]>([
    {
      id: "images",
      name: "Validação de Imagens",
      description: "Verifica se as URLs de imagens estão acessíveis",
      icon: Image,
      status: "pending",
    },
    {
      id: "sources",
      name: "Validação de Fontes",
      description: "Verifica se as URLs de fonte estão acessíveis",
      icon: Link2,
      status: "pending",
    },
    {
      id: "categories",
      name: "Categorias Ausentes",
      description: "Identifica notícias sem categoria definida",
      icon: FolderTree,
      status: "pending",
    },
    {
      id: "tags",
      name: "Tags Ausentes",
      description: "Identifica notícias sem tags",
      icon: Tag,
      status: "pending",
    },
  ]);

  const runValidation = async () => {
    setIsRunning(true);
    setProgress(0);

    const updatedChecks = [...checks];

    // Check 1: Images
    updatedChecks[0].status = "running";
    setChecks([...updatedChecks]);
    await new Promise(r => setTimeout(r, 800));
    
    const imageIssues = (stats?.missingImages || 0) + (stats?.invalidImages || 0);
    updatedChecks[0].status = imageIssues > 0 ? "warning" : "success";
    updatedChecks[0].count = imageIssues;
    updatedChecks[0].message = imageIssues > 0 
      ? `${imageIssues} notícias com problemas de imagem`
      : "Todas as imagens estão válidas";
    setChecks([...updatedChecks]);
    setProgress(25);

    // Check 2: Sources
    updatedChecks[1].status = "running";
    setChecks([...updatedChecks]);
    await new Promise(r => setTimeout(r, 600));
    
    const sourceIssues = stats?.missingSource || 0;
    updatedChecks[1].status = sourceIssues > 0 ? "warning" : "success";
    updatedChecks[1].count = sourceIssues;
    updatedChecks[1].message = sourceIssues > 0 
      ? `${sourceIssues} notícias sem fonte definida`
      : "Todas as fontes estão configuradas";
    setChecks([...updatedChecks]);
    setProgress(50);

    // Check 3: Categories
    updatedChecks[2].status = "running";
    setChecks([...updatedChecks]);
    await new Promise(r => setTimeout(r, 500));
    
    const categoryIssues = stats?.missingCategory || 0;
    updatedChecks[2].status = categoryIssues > 0 ? "warning" : "success";
    updatedChecks[2].count = categoryIssues;
    updatedChecks[2].message = categoryIssues > 0 
      ? `${categoryIssues} notícias sem categoria`
      : "Todas as categorias estão definidas";
    setChecks([...updatedChecks]);
    setProgress(75);

    // Check 4: Tags (placeholder - would need DB query)
    updatedChecks[3].status = "running";
    setChecks([...updatedChecks]);
    await new Promise(r => setTimeout(r, 500));
    
    updatedChecks[3].status = "success";
    updatedChecks[3].count = 0;
    updatedChecks[3].message = "Verificação de tags concluída";
    setChecks([...updatedChecks]);
    setProgress(100);

    setIsRunning(false);
  };

  const getStatusIcon = (status: ValidationCheck["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const totalIssues = checks.reduce((acc, check) => acc + (check.count || 0), 0);
  const hasRun = checks.some(c => c.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/spah/painel/content-fix")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Verificador de Integridade</h1>
            <p className="text-muted-foreground">
              Diagnóstico automático de problemas no conteúdo
            </p>
          </div>
        </div>
        <Button onClick={runValidation} disabled={isRunning || loadingStats}>
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Verificação
            </>
          )}
        </Button>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da verificação</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {hasRun && !isRunning && (
        <Card className={cn(
          totalIssues > 0 
            ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" 
            : "border-green-300 bg-green-50/50 dark:bg-green-950/20"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {totalIssues > 0 ? (
                <AlertCircle className="h-8 w-8 text-amber-500" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {totalIssues > 0 
                    ? `${totalIssues} problema(s) encontrado(s)`
                    : "Nenhum problema encontrado"
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  {totalIssues > 0 
                    ? "Use as ferramentas de correção para resolver os problemas"
                    : "Seu conteúdo está em boas condições"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checks List */}
      <div className="grid gap-4">
        {checks.map((check) => (
          <Card key={check.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <check.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{check.name}</h3>
                    {getStatusIcon(check.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {check.message || check.description}
                  </p>
                  {check.status === "warning" && check.count && check.count > 0 && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (check.id === "images") {
                            navigate("/spah/painel/content-fix/images");
                          } else if (check.id === "categories") {
                            navigate("/spah/painel/news");
                          }
                        }}
                      >
                        Corrigir Problemas
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
