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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useSyndicationInbox, 
  useApproveInboxItem, 
  useRejectInboxItem, 
  useBulkApproveInboxItems, 
  useBulkRejectInboxItems,
  SyndicationInboxStatus 
} from "@/hooks/useSyndicationInbox";
import { useQueryClient } from "@tanstack/react-query";

export default function PartnersInbox() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Use real hooks instead of mock data
  const { data: inboxItems = [], isLoading, refetch } = useSyndicationInbox(
    statusFilter === "all" ? undefined : statusFilter as SyndicationInboxStatus
  );
  const approveItem = useApproveInboxItem();
  const rejectItem = useRejectInboxItem();
  const bulkApprove = useBulkApproveInboxItems();
  const bulkReject = useBulkRejectInboxItems();

  const filteredItems = inboxItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         (item.source?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Calculate dynamic stats
  const pendingCount = inboxItems.filter(i => i.status === "inbox").length;
  const approvedTodayCount = inboxItems.filter(i => {
    if (i.status !== "approved" || !i.reviewed_at) return false;
    const reviewDate = new Date(i.reviewed_at);
    const today = new Date();
    return reviewDate.toDateString() === today.toDateString();
  }).length;
  const rejectedTodayCount = inboxItems.filter(i => {
    if (i.status !== "rejected" || !i.reviewed_at) return false;
    const reviewDate = new Date(i.reviewed_at);
    const today = new Date();
    return reviewDate.toDateString() === today.toDateString();
  }).length;

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

  const handleApprove = async (id: string) => {
    await approveItem.mutateAsync({ id, createDraft: true });
    setSelectedItems(prev => prev.filter(i => i !== id));
  };

  const handleReject = async (id: string) => {
    await rejectItem.mutateAsync(id);
    setSelectedItems(prev => prev.filter(i => i !== id));
  };

  const handleBulkApprove = async () => {
    await bulkApprove.mutateAsync(selectedItems);
    setSelectedItems([]);
  };

  const handleBulkReject = async () => {
    await bulkReject.mutateAsync(selectedItems);
    setSelectedItems([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "inbox":
        return <Badge variant="secondary">Pendente</Badge>;
      case "approved":
        return <Badge variant="default">Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeitado</Badge>;
      case "published":
        return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inbox de Parceiros</h1>
          <p className="text-muted-foreground">Artigos recebidos via sindicação para revisão</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Stats Cards - Dynamic from DB */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aprovados Hoje</CardDescription>
            <CardTitle className="text-2xl">{approvedTodayCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejeitados Hoje</CardDescription>
            <CardTitle className="text-2xl">{rejectedTodayCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total no Inbox</CardDescription>
            <CardTitle className="text-2xl">{inboxItems.length}</CardTitle>
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
                <SelectItem value="inbox">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} selecionado(s)
              </span>
              <Button 
                size="sm" 
                variant="default"
                onClick={handleBulkApprove}
                disabled={bulkApprove.isPending}
              >
                {bulkApprove.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Aprovar
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={handleBulkReject}
                disabled={bulkReject.isPending}
              >
                {bulkReject.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Rejeitar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
                      {item.source?.name || "Fonte desconhecida"}
                      <a 
                        href={item.original_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(item.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => window.open(item.original_url, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.status === "inbox" && (
                        <>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-green-600"
                            onClick={() => handleApprove(item.id)}
                            disabled={approveItem.isPending}
                          >
                            {approveItem.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-red-600"
                            onClick={() => handleReject(item.id)}
                            disabled={rejectItem.isPending}
                          >
                            {rejectItem.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum artigo encontrado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}