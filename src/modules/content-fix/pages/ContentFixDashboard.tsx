import { useNavigate } from "react-router-dom";
import { Wrench, Image, Calendar, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import { FixStatsGrid } from "../components/FixStatsGrid";
import { useNewsWithIssues } from "../hooks/useNewsWithIssues";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ContentFixDashboard() {
  const navigate = useNavigate();
  
  // Get urgent news (combined issues)
  const { data: imageIssues } = useNewsWithIssues({ issueType: "invalid_image", limit: 5 });
  const { data: dateIssues } = useNewsWithIssues({ issueType: "future_date", limit: 5 });

  const urgentNews = [
    ...(imageIssues || []).map(n => ({ ...n, issueType: "image" as const })),
    ...(dateIssues || []).map(n => ({ ...n, issueType: "date" as const })),
  ].slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Centro de Correção</h1>
            <p className="text-muted-foreground">
              Ferramentas para validar e corrigir conteúdo em lote
            </p>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <FixStatsGrid />

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/admin/content-fix/images")}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/30">
                <Image className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-base">Corrigir Imagens</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3">
              Substitua imagens quebradas ou ausentes usando extração automática da fonte
            </CardDescription>
            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
              Acessar <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/admin/content-fix/dates")}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <CardTitle className="text-base">Corrigir Datas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3">
              Corrija datas futuras ou recupere a data original de publicação da fonte
            </CardDescription>
            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
              Acessar <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/admin/content-fix/validator")}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base">Verificar Integridade</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3">
              Verifique URLs, detecte duplicatas e valide a integridade do conteúdo
            </CardDescription>
            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
              Acessar <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Urgent News */}
      {urgentNews.length > 0 && (
        <DashboardPanel
          title="Correções Urgentes"
          description="Notícias com problemas críticos que requerem atenção"
          icon={AlertCircle}
          iconColor="text-destructive"
        >
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {urgentNews.map((news) => (
                <div
                  key={news.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{news.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {news.published_at && format(new Date(news.published_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge 
                      variant={news.issueType === "image" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {news.issueType === "image" ? "Imagem" : "Data"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(
                        news.issueType === "image" 
                          ? "/admin/content-fix/images" 
                          : "/admin/content-fix/dates"
                      )}
                    >
                      Corrigir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DashboardPanel>
      )}
    </div>
  );
}
