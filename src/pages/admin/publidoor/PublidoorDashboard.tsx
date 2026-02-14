import { Link } from "react-router-dom";
import { Plus, Eye, Calendar, MapPin, FolderOpen, TrendingUp, AlertTriangle, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePublidoorDashboardStats, usePublidoorItems } from "@/hooks/usePublidoor";
import { PUBLIDOOR_STATUS_LABELS, PUBLIDOOR_TYPE_LABELS } from "@/types/publidoor";

export default function PublidoorDashboard() {
  const { data: stats, isLoading: statsLoading } = usePublidoorDashboardStats();
  const { data: items, isLoading: itemsLoading } = usePublidoorItems();

  const activeItems = items?.filter((i) => i.status === "published") || [];
  const pendingItems = items?.filter((i) => i.status === "review") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            📢 Publidoor
          </h1>
          <p className="text-muted-foreground">
            Outdoor digital urbano premium para sua cidade
          </p>
        </div>
        <Button asChild>
          <Link to="/spah/painel/publidoor/criar">
            <Plus className="mr-2 h-4 w-4" />
            Novo Publidoor
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCount || 0}</div>
            <p className="text-xs text-muted-foreground">Publidoors em exibição</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.scheduledCount || 0}</div>
            <p className="text-xs text-muted-foreground">Prontos para publicar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaços</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.availableSpaces || 0}</div>
            <p className="text-xs text-muted-foreground">Locais disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground">Campanhas ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalImpressions?.toLocaleString("pt-BR") || 0}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalClicks?.toLocaleString("pt-BR") || 0}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ctr || 0}%</div>
            <p className="text-xs text-muted-foreground">Taxa de cliques</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Est.</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats?.estimatedRevenue?.toLocaleString("pt-BR") || 0}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(pendingItems.length > 0 || stats?.availableSpaces === 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-700">
            {pendingItems.length > 0 && (
              <p>⏳ {pendingItems.length} Publidoor(s) aguardando aprovação</p>
            )}
            {stats?.availableSpaces === 0 && (
              <p>📍 Todos os locais de exibição estão ocupados</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Publidoors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Publidoors Ativos</CardTitle>
          <CardDescription>Exibições em andamento</CardDescription>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : activeItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum Publidoor ativo no momento.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/spah/painel/publidoor/criar">Criar primeiro Publidoor</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    {item.media_url ? (
                      <img
                        src={item.media_url}
                        alt={item.internal_name}
                        className="h-12 w-20 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-20 bg-muted rounded flex items-center justify-center">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.internal_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {PUBLIDOOR_TYPE_LABELS[item.type]}
                        {item.advertiser && ` • ${item.advertiser.company_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-green-500">
                      {PUBLIDOOR_STATUS_LABELS[item.status]}
                    </Badge>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/spah/painel/publidoor/editar/${item.id}`}>Editar</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {activeItems.length > 5 && (
                <div className="text-center pt-2">
                  <Button asChild variant="link">
                    <Link to="/spah/painel/publidoor/campanhas">
                      Ver todos ({activeItems.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
