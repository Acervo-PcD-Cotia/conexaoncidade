import { BarChart3, TrendingUp, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyAnalyticsStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyAnalyticsState({
  title = "Nenhum dado ainda",
  description = "Os dados de analytics começarão a aparecer assim que houver tráfego no portal.",
  action,
}: EmptyAnalyticsStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div className="absolute -right-1 -top-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
        
        {action || (
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/spah/painel/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurar Tracking
              </Link>
            </Button>
            <Button asChild>
              <Link to="/spah/painel/news">
                Ver Notícias
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
