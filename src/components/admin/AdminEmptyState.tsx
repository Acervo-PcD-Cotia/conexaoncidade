import { ReactNode, ElementType } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileQuestion, Plus } from 'lucide-react';

interface AdminEmptyStateProps {
  icon?: ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
}

export function AdminEmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  children,
}: AdminEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {action && (
          action.href ? (
            <Button asChild className="mt-2">
              <Link to={action.href}>
                <Plus className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={action.onClick} className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          )
        )}

        {children}
      </CardContent>
    </Card>
  );
}

// Integration Pending State
interface IntegrationPendingStateProps {
  featureName: string;
  description?: string;
}

export function IntegrationPendingState({ 
  featureName, 
  description = 'Esta funcionalidade está em desenvolvimento e estará disponível em breve.' 
}: IntegrationPendingStateProps) {
  return (
    <Card className="border-dashed border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/10">
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium">
          Em Desenvolvimento
        </div>
        
        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-medium">{featureName}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <Button variant="outline" asChild className="mt-2">
          <Link to="/spah/painel">Voltar ao Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
