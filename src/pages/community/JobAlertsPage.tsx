import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bell, BellOff, Briefcase, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobAlertPreferences, useSaveJobAlertPreferences } from "@/hooks/useJobAlerts";
import { JOB_TYPES, WORK_MODES, JOB_CATEGORIES } from "@/hooks/useJobs";

export default function JobAlertsPage() {
  const { user } = useAuth();
  const { data: preferences, isLoading } = useJobAlertPreferences();
  const savePreferences = useSaveJobAlertPreferences();

  const [isActive, setIsActive] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");

  // Load existing preferences
  useEffect(() => {
    if (preferences) {
      setIsActive(preferences.is_active);
      setSelectedCategories(preferences.categories || []);
      setSelectedJobTypes(preferences.job_types || []);
      setSelectedWorkModes(preferences.work_modes || []);
      setMinSalary(preferences.min_salary?.toString() || "");
      setKeywords(preferences.keywords || "");
    }
  }, [preferences]);

  const handleSave = () => {
    savePreferences.mutate({
      is_active: isActive,
      categories: selectedCategories,
      job_types: selectedJobTypes,
      work_modes: selectedWorkModes,
      min_salary: minSalary ? parseFloat(minSalary) : null,
      keywords: keywords || null,
    });
  };

  const toggleCategory = (value: string) => {
    setSelectedCategories(prev =>
      prev.includes(value)
        ? prev.filter(c => c !== value)
        : [...prev, value]
    );
  };

  const toggleJobType = (value: string) => {
    setSelectedJobTypes(prev =>
      prev.includes(value)
        ? prev.filter(t => t !== value)
        : [...prev, value]
    );
  };

  const toggleWorkMode = (value: string) => {
    setSelectedWorkModes(prev =>
      prev.includes(value)
        ? prev.filter(m => m !== value)
        : [...prev, value]
    );
  };

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <BellOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Faça login para configurar alertas</h1>
        <p className="text-muted-foreground mb-6">
          Você precisa estar logado para receber alertas de vagas.
        </p>
        <Button asChild>
          <Link to="/auth?redirect=/comunidade/alertas-vagas">
            Fazer Login
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8 max-w-2xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Alertas de Vagas - Comunidade | Conexão na Cidade</title>
        <meta name="description" content="Configure alertas para receber notificações de vagas compatíveis com seu perfil." />
      </Helmet>

      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/comunidade/empregos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <Bell className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Alertas de Vagas</h1>
            <p className="text-muted-foreground">
              Receba notificações quando vagas compatíveis forem publicadas
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Ativar Alertas</CardTitle>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
            <CardDescription>
              {isActive 
                ? "Você receberá notificações push de vagas compatíveis"
                : "Alertas desativados - você não receberá notificações"
              }
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Categorias de Interesse</CardTitle>
            <CardDescription>
              Selecione as áreas que você tem interesse (deixe vazio para todas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {JOB_CATEGORIES.map((cat) => (
                <div key={cat.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.value}`}
                    checked={selectedCategories.includes(cat.value)}
                    onCheckedChange={() => toggleCategory(cat.value)}
                    disabled={!isActive}
                  />
                  <Label 
                    htmlFor={`cat-${cat.value}`}
                    className={!isActive ? "text-muted-foreground" : ""}
                  >
                    {cat.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Tipo de Contrato</CardTitle>
            <CardDescription>
              Que tipos de contrato você aceita?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {JOB_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={selectedJobTypes.includes(type.value)}
                    onCheckedChange={() => toggleJobType(type.value)}
                    disabled={!isActive}
                  />
                  <Label 
                    htmlFor={`type-${type.value}`}
                    className={!isActive ? "text-muted-foreground" : ""}
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Modo de Trabalho</CardTitle>
            <CardDescription>
              Qual modalidade de trabalho você prefere?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {WORK_MODES.map((mode) => (
                <div key={mode.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mode-${mode.value}`}
                    checked={selectedWorkModes.includes(mode.value)}
                    onCheckedChange={() => toggleWorkMode(mode.value)}
                    disabled={!isActive}
                  />
                  <Label 
                    htmlFor={`mode-${mode.value}`}
                    className={!isActive ? "text-muted-foreground" : ""}
                  >
                    {mode.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Salário Mínimo</CardTitle>
            <CardDescription>
              Só receber alertas para vagas acima deste valor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">R$</span>
              <Input
                type="number"
                placeholder="Ex: 3000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                disabled={!isActive}
                className="max-w-[200px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Palavras-chave</CardTitle>
            <CardDescription>
              Termos que devem aparecer no título ou descrição (separados por vírgula)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Ex: react, frontend, desenvolvedor"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={!isActive}
            />
          </CardContent>
        </Card>

        <Button 
          onClick={handleSave}
          className="w-full"
          disabled={savePreferences.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {savePreferences.isPending ? "Salvando..." : "Salvar Preferências"}
        </Button>
      </div>
    </>
  );
}
