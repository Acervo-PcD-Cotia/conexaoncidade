import { useState } from "react";
import { 
  Rss, 
  Plus, 
  Settings2, 
  Trash2,
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminHeader } from "@/components/admin/AdminHeader";

// Mock data
const mockSources = [
  {
    id: "1",
    partner: "Portal ABC News",
    categories: ["Política", "Economia"],
    keywords: ["são paulo", "governo"],
    dailyLimit: 10,
    importMode: "teaser",
    rewriteEnabled: true,
    isActive: true,
    lastImport: new Date(),
    itemsImported: 156,
  },
  {
    id: "2",
    partner: "Diário Regional",
    categories: ["Cidades", "Cultura"],
    keywords: [],
    dailyLimit: 5,
    importMode: "full",
    rewriteEnabled: true,
    isActive: true,
    lastImport: new Date(Date.now() - 7200000),
    itemsImported: 89,
  },
  {
    id: "3",
    partner: "Tech News BR",
    categories: ["Tecnologia"],
    keywords: ["startup", "inovação"],
    dailyLimit: 8,
    importMode: "rewrite",
    rewriteEnabled: true,
    isActive: false,
    lastImport: new Date(Date.now() - 86400000),
    itemsImported: 42,
  },
];

export default function PartnersSources() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredSources = mockSources.filter(source => {
    const matchesSearch = source.partner.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && source.isActive) ||
      (statusFilter === "paused" && !source.isActive);
    return matchesSearch && matchesStatus;
  });

  const getImportModeBadge = (mode: string) => {
    switch (mode) {
      case "teaser":
        return <Badge variant="outline">Teaser</Badge>;
      case "full":
        return <Badge variant="secondary">Texto Completo</Badge>;
      case "rewrite":
        return <Badge>Reescrita IA</Badge>;
      default:
        return <Badge variant="outline">{mode}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader
          title="Fontes de Importação"
          description="Configure quais conteúdos importar de cada parceiro"
        />
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Assinatura
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Assinaturas Ativas</CardDescription>
            <CardTitle className="text-2xl">
              {mockSources.filter(s => s.isActive).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Importado</CardDescription>
            <CardTitle className="text-2xl">
              {mockSources.reduce((acc, s) => acc + s.itemsImported, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Limite Diário Total</CardDescription>
            <CardTitle className="text-2xl">
              {mockSources.filter(s => s.isActive).reduce((acc, s) => acc + s.dailyLimit, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Com Reescrita IA</CardDescription>
            <CardTitle className="text-2xl">
              {mockSources.filter(s => s.rewriteEnabled).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por parceiro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="paused">Pausados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parceiro</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead>Palavras-chave</TableHead>
              <TableHead>Modo</TableHead>
              <TableHead>Limite/Dia</TableHead>
              <TableHead>Importados</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSources.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="font-medium">{source.partner}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {source.categories.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {source.keywords.length > 0 ? (
                    <span className="text-sm text-muted-foreground">
                      {source.keywords.join(", ")}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Todas</span>
                  )}
                </TableCell>
                <TableCell>{getImportModeBadge(source.importMode)}</TableCell>
                <TableCell>{source.dailyLimit}</TableCell>
                <TableCell>{source.itemsImported}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={source.isActive} />
                    <span className="text-sm">
                      {source.isActive ? "Ativo" : "Pausado"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar Agora
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings2 className="h-4 w-4 mr-2" />
                        Configurar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {source.isActive ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredSources.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Rss className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Nenhuma fonte configurada</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
