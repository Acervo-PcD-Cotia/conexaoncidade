import { Link } from 'react-router-dom';
import { 
  Rocket, FileText, DollarSign, TrendingUp, Newspaper, Calendar, Share2,
  User, Edit, Briefcase, Layers, Users, GraduationCap, ArrowRight, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTrainingModules, useUserTrainingProgress, useTrainingSteps } from '@/hooks/useTraining';

const iconMap: Record<string, React.ElementType> = {
  Rocket,
  FileText,
  DollarSign,
  TrendingUp,
  Newspaper,
  Calendar,
  Share2,
  User,
  Edit,
  Briefcase,
  Layers,
  Users,
};

const categoryLabels: Record<string, { label: string; description: string }> = {
  getting_started: {
    label: 'Começar Agora',
    description: 'Primeiros passos no Portal Conexão',
  },
  by_module: {
    label: 'Por Módulo',
    description: 'Aprenda cada funcionalidade em detalhes',
  },
  by_profile: {
    label: 'Por Perfil',
    description: 'Trilhas personalizadas para seu papel',
  },
};

function ModuleCard({ module }: { module: any }) {
  const Icon = iconMap[module.icon || 'FileText'] || FileText;
  const { data: steps = [] } = useTrainingSteps(module.id);
  const { data: progress = [] } = useUserTrainingProgress();
  
  const completedSteps = steps.filter(s => progress.some(p => p.step_id === s.id)).length;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  const isComplete = progressPercent === 100;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
            <Icon className={`h-5 w-5 ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-primary'}`} />
          </div>
          {isComplete && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{module.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {module.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{completedSteps} de {steps.length} etapas</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
          <Link to={`/admin/training/${module.key}`}>
            {isComplete ? 'Revisar' : 'Continuar'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TrainingHub() {
  const { data: modules = [], isLoading } = useTrainingModules();
  const { data: progress = [] } = useUserTrainingProgress();

  const categories = ['getting_started', 'by_module', 'by_profile'];
  
  const totalModules = modules.length;
  const completedModules = modules.filter(m => {
    // This is a simplified check - would need steps count per module
    return false; // Will be calculated properly with useModuleWithProgress
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Universidade Conexão
          </h1>
          <p className="text-muted-foreground mt-1">
            Aprenda a usar todas as funcionalidades do Portal Conexão
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Seu Progresso Geral</h3>
              <p className="text-sm text-muted-foreground">
                Continue aprendendo para dominar a plataforma
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">{progress.length}</span>
              <p className="text-sm text-muted-foreground">etapas concluídas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules by Category */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(j => (
                  <Card key={j} className="animate-pulse">
                    <CardHeader>
                      <div className="h-10 w-10 bg-muted rounded" />
                      <div className="h-5 w-3/4 bg-muted rounded" />
                      <div className="h-4 w-full bg-muted rounded" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-2 w-full bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        categories.map(category => {
          const categoryModules = modules.filter(m => m.category === category);
          if (categoryModules.length === 0) return null;
          
          const { label, description } = categoryLabels[category] || { label: category, description: '' };
          
          return (
            <div key={category} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{label}</h2>
                <p className="text-muted-foreground">{description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryModules.map(module => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Precisa de ajuda?</CardTitle>
          <CardDescription>
            Além dos treinamentos, você pode acessar ajuda contextual em qualquer tela
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Clique no ícone <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold mx-1">?</span> 
            disponível em cada página para obter ajuda específica sobre aquela funcionalidade.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
