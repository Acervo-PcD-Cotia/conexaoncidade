import { useState } from "react";
import { 
  Inbox, 
  Check, 
  X, 
  Eye, 
  Filter,
  RefreshCw,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for demonstration
const mockInboxItems = [
  {
    id: "1",
    title: "Nova política de mobilidade urbana é aprovada",
    source: "Portal ABC News",
    category: "Política",
    receivedAt: new Date(),
    status: "pending",
    excerpt: "A câmara municipal aprovou hoje a nova política de mobilidade...",
  },
  {
    id: "2", 
    title: "Festival de música movimenta economia local",
    source: "Diário Regional",
    category: "Cultura",
    receivedAt: new Date(Date.now() - 3600000),
    status: "pending",
    excerpt: "O festival anual de música atraiu mais de 50 mil visitantes...",
  },
  {
    id: "3",
    title: "Startup local recebe investimento milionário",
    source: "Tech News BR",
    category: "Economia",
    receivedAt: new Date(Date.now() - 7200000),
    status: "approved",
    excerpt: "A empresa de tecnologia XYZ fechou rodada de investimento...",
  },
];

export default function PartnersInbox() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredItems = mockInboxItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.source.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(i => i.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "approved":
        return <Badge variant="default">Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader
          title="Inbox de Parceiros"
          description="Artigos recebidos via sindicação para revisão"
        />
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-2xl">12</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aprovados Hoje</CardDescription>
            <CardTitle className="text-2xl">5</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejeitados Hoje</CardDescription>
            <CardTitle className="text-2xl">2</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Parceiros Ativos</CardDescription>
            <CardTitle className="text-2xl">8</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título ou fonte..."
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
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} selecionado(s)
              </span>
              <Button size="sm" variant="default">
                <Check className="h-4 w-4 mr-1" />
                Aprovar
              </Button>
              <Button size="sm" variant="destructive">
                <X className="h-4 w-4 mr-1" />
                Rejeitar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Artigo</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Recebido
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium line-clamp-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.excerpt}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {item.source}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell>
                  {format(item.receivedAt, "dd/MM HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {item.status === "pending" && (
                      <>
                        <Button size="icon" variant="ghost" className="text-green-600">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Nenhum artigo encontrado</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
