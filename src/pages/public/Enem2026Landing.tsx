import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  GraduationCap, 
  PenTool, 
  BookOpen, 
  Calculator, 
  FlaskConical,
  Globe,
  CheckCircle2,
  Target,
  TrendingUp,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mainModule = {
  id: "redacao-nota-1000",
  title: "Redação Nota 1000",
  description: "Domine a estrutura dissertativa-argumentativa e conquiste sua nota máxima no ENEM 2026",
  icon: PenTool,
  color: "indigo",
  weeks: 10,
  status: "available" as const,
  href: "/spah/painel/academy/enem/redacao-nota-1000",
};

const upcomingModules = [
  { 
    id: "linguagens", 
    title: "Linguagens", 
    icon: BookOpen, 
    color: "rose",
    description: "Interpretação de textos, gramática e literatura"
  },
  { 
    id: "humanas", 
    title: "Humanas", 
    icon: Globe, 
    color: "amber",
    description: "História, Geografia, Filosofia e Sociologia"
  },
  { 
    id: "matematica", 
    title: "Matemática", 
    icon: Calculator, 
    color: "sky",
    description: "Fórmulas, raciocínio lógico e resolução de problemas"
  },
  { 
    id: "natureza", 
    title: "Natureza", 
    icon: FlaskConical, 
    color: "emerald",
    description: "Física, Química e Biologia aplicadas"
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Escolha seu módulo",
    description: "Comece pela Redação ou aguarde os módulos de cada área do conhecimento",
    icon: Target,
  },
  {
    step: 2,
    title: "Siga o cronograma",
    description: "10 semanas de conteúdo estruturado com progressão obrigatória",
    icon: Clock,
  },
  {
    step: 3,
    title: "Pratique com IA",
    description: "Submeta suas redações e receba correção detalhada com feedback da IA Corretora",
    icon: TrendingUp,
  },
];

export default function Enem2026Landing() {
  return (
    <>
      <Helmet>
        <title>ENEM 2026 - Preparação Completa | Conexão na Cidade</title>
        <meta 
          name="description" 
          content="Prepare-se para o ENEM 2026 com cursos estruturados, correção de redação por IA e acompanhamento personalizado. Comece agora!" 
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent" />
        
        <div className="container relative py-16 md:py-24">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Preparação Exclusiva
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              ENEM 2026
            </h1>
            
            <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl">
              Sua jornada para a aprovação começa aqui. Conteúdo estruturado, 
              correção inteligente e acompanhamento personalizado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold"
              >
                <Link to={mainModule.href}>
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Começar Agora
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link to="/spah">
                  Criar Conta Grátis
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Module Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Módulo Principal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comece pelo que mais impacta sua nota: a Redação vale 1000 pontos e 
              pode ser o diferencial para sua aprovação.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                    <PenTool className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{mainModule.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {mainModule.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                  Disponível
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {mainModule.weeks} semanas
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Correção por IA
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="h-4 w-4" />
                  Metodologia ENEM
                </span>
              </div>
              
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link to={mainModule.href}>
                  Acessar Módulo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Modules */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Em Breve
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Estamos preparando conteúdo completo para todas as áreas do conhecimento do ENEM.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingModules.map((module) => {
              const Icon = module.icon;
              const colorClasses = {
                rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
                amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
                sky: "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
                emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
              };
              
              return (
                <Card key={module.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardHeader className="pb-3">
                    <div className={cn("p-2.5 rounded-lg w-fit", colorClasses[module.color as keyof typeof colorClasses])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {module.title}
                      <Badge variant="outline" className="text-xs font-normal">
                        Em breve
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Um método estruturado para maximizar seu aprendizado e garantir sua evolução.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-4">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                    Passo {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">É gratuito?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  O acesso básico aos módulos é gratuito. Funcionalidades avançadas como 
                  correção ilimitada de redações podem estar disponíveis em planos premium.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Como funciona a correção por IA?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Nossa IA Corretora avalia sua redação nas 5 competências oficiais do ENEM, 
                  fornecendo notas detalhadas e feedback personalizado para cada aspecto do texto.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Posso acessar pelo celular?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Sim! A plataforma é totalmente responsiva e você pode estudar de qualquer 
                  dispositivo, a qualquer hora.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar sua preparação?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Não deixe para última hora. Comece agora e garanta sua vaga no ensino superior.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold"
            >
              <Link to={mainModule.href}>
                <GraduationCap className="h-5 w-5 mr-2" />
                Começar Agora
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
              className="border-white/40 text-white hover:bg-white/10"
            >
              <Link to="/spah">
                Criar Conta
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
