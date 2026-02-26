import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, UserPlus, Mail, Phone, Download, Filter, Search, 
  MoreHorizontal, Eye, Pencil, Trash2, Plus, CheckCircle, 
  Clock, XCircle, Target, TrendingUp, MessageSquare, Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { utils, writeFile } from "xlsx";

const STATUS_CONFIG = {
  new: { label: "Novo", icon: UserPlus, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  contacted: { label: "Contatado", icon: MessageSquare, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  qualified: { label: "Qualificado", icon: Target, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  converted: { label: "Convertido", icon: CheckCircle, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  lost: { label: "Perdido", icon: XCircle, color: "bg-red-500/10 text-red-500 border-red-500/20" },
};

export default function CoreLeads() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("leads");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormSlug, setNewFormSlug] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [leadDetailId, setLeadDetailId] = useState<string | null>(null);

  // Fetch leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["core-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("core_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  // Fetch forms
  const { data: forms = [], isLoading: formsLoading } = useQuery({
    queryKey: ["core-lead-forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("core_lead_forms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Update lead status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("core_leads")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["core-leads"] });
      toast.success("Status atualizado");
    },
  });

  // Create form
  const createFormMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("core_lead_forms").insert({
        name: newFormName,
        slug: newFormSlug || newFormName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: newFormDescription,
        fields: [
          { type: "text", name: "name", label: "Nome", required: true },
          { type: "email", name: "email", label: "E-mail", required: true },
          { type: "tel", name: "phone", label: "Telefone", required: false },
          { type: "textarea", name: "message", label: "Mensagem", required: false },
        ],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["core-lead-forms"] });
      setFormDialogOpen(false);
      setNewFormName("");
      setNewFormSlug("");
      setNewFormDescription("");
      toast.success("Formulário criado com sucesso");
    },
  });

  // Delete lead
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("core_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["core-leads"] });
      toast.success("Lead removido");
    },
  });

  // Filter leads
  const filteredLeads = leads.filter((lead: any) => {
    const matchSearch = !searchTerm || 
      (lead.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone?.includes(searchTerm));
    const matchStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // KPIs
  const totalLeads = leads.length;
  const newLeads = leads.filter((l: any) => l.status === "new").length;
  const qualifiedLeads = leads.filter((l: any) => l.status === "qualified").length;
  const convertedLeads = leads.filter((l: any) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";

  // Export CSV
  const handleExportCSV = () => {
    const exportData = filteredLeads.map((lead: any) => ({
      Nome: lead.name || "",
      Email: lead.email || "",
      Telefone: lead.phone || "",
      WhatsApp: lead.whatsapp || "",
      Status: STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG]?.label || lead.status,
      Origem: lead.source || "",
      Segmento: lead.segment || "",
      "UTM Source": lead.utm_source || "",
      "UTM Medium": lead.utm_medium || "",
      "UTM Campaign": lead.utm_campaign || "",
      Tags: (lead.tags || []).join(", "),
      Score: lead.score || 0,
      "Data Captação": lead.created_at ? format(new Date(lead.created_at), "dd/MM/yyyy HH:mm") : "",
    }));
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Leads");
    writeFile(wb, `leads-core-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Exportação concluída");
  };

  const selectedLead = leadDetailId ? leads.find((l: any) => l.id === leadDetailId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10">
            <Users className="h-6 w-6 text-teal-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Captação de Leads</h1>
            <p className="text-sm text-muted-foreground">
              Formulários, segmentação e funil de conversão
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1.5" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-muted/30">
          <CardContent className="p-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{totalLeads}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{newLeads}</p>
              <p className="text-xs text-muted-foreground">Novos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Target className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{qualifiedLeads}</p>
              <p className="text-xs text-muted-foreground">Qualificados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{convertedLeads}</p>
              <p className="text-xs text-muted-foreground">Convertidos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Conversão</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="leads">Leads ({totalLeads})</TabsTrigger>
          <TabsTrigger value="forms">Formulários ({forms.length})</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
        </TabsList>

        {/* LEADS TAB */}
        <TabsContent value="leads" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-1.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {leadsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando leads...</div>
          ) : filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum lead encontrado</p>
                <p className="text-sm mt-1">Leads capturados por formulários aparecerão aqui.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Lead</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Contato</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium hidden lg:table-cell">Origem</th>
                      <th className="text-left p-3 font-medium hidden lg:table-cell">Score</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Data</th>
                      <th className="text-right p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead: any) => {
                      const status = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new;
                      const StatusIcon = status.icon;
                      return (
                        <tr key={lead.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{lead.name || "Sem nome"}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{lead.email}</p>
                            </div>
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <div className="space-y-0.5">
                              {lead.email && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" /> {lead.email}
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" /> {lead.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-3 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {lead.source && (
                                <Badge variant="secondary" className="text-[10px]">{lead.source}</Badge>
                              )}
                              {lead.utm_source && (
                                <Badge variant="outline" className="text-[10px]">{lead.utm_source}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3 hidden lg:table-cell">
                            <span className="font-mono text-xs">{lead.score || 0}</span>
                          </td>
                          <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">
                            {lead.created_at && format(new Date(lead.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                          </td>
                          <td className="p-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setLeadDetailId(lead.id)}>
                                  <Eye className="h-4 w-4 mr-2" /> Ver detalhes
                                </DropdownMenuItem>
                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                  key !== lead.status && (
                                    <DropdownMenuItem key={key} onClick={() => updateStatusMutation.mutate({ id: lead.id, status: key })}>
                                      <cfg.icon className="h-4 w-4 mr-2" /> Marcar como {cfg.label}
                                    </DropdownMenuItem>
                                  )
                                ))}
                                <DropdownMenuItem className="text-destructive" onClick={() => deleteLeadMutation.mutate(lead.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* FORMS TAB */}
        <TabsContent value="forms" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Formulários de captação configurados</p>
            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Novo Formulário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Formulário de Captação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome do Formulário</Label>
                    <Input value={newFormName} onChange={(e) => setNewFormName(e.target.value)} placeholder="Ex: Contato Principal" />
                  </div>
                  <div>
                    <Label>Slug (URL)</Label>
                    <Input value={newFormSlug} onChange={(e) => setNewFormSlug(e.target.value)} placeholder="contato-principal" />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea value={newFormDescription} onChange={(e) => setNewFormDescription(e.target.value)} placeholder="Descrição do formulário..." />
                  </div>
                  <Button onClick={() => createFormMutation.mutate()} disabled={!newFormName || createFormMutation.isPending} className="w-full">
                    {createFormMutation.isPending ? "Criando..." : "Criar Formulário"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {formsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando formulários...</div>
          ) : forms.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum formulário criado</p>
                <p className="text-sm mt-1">Crie formulários para capturar leads do seu portal.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map((form: any) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{form.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">/{form.slug}</p>
                      </div>
                      <Badge variant={form.is_active ? "default" : "secondary"}>
                        {form.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {form.description && (
                      <p className="text-xs text-muted-foreground">{form.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{form.submissions_count || 0} envios</span>
                      <span>{form.fields?.length || 0} campos</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* FUNNEL TAB */}
        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Funil de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const count = leads.filter((l: any) => l.status === key).length;
                  const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <span className="font-medium">{cfg.label}</span>
                        </div>
                        <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Segmentação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const segments = leads.reduce((acc: Record<string, number>, l: any) => {
                  const seg = l.segment || "Sem segmento";
                  acc[seg] = (acc[seg] || 0) + 1;
                  return acc;
                }, {});
                const entries = Object.entries(segments).sort((a, b) => (b[1] as number) - (a[1] as number));
                return entries.length > 0 ? (
                  <div className="space-y-2">
                    {entries.map(([seg, count]) => (
                      <div key={seg} className="flex items-center justify-between text-sm">
                        <span>{seg}</span>
                        <Badge variant="secondary">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum lead segmentado ainda.
                  </p>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Detail Dialog */}
      <Dialog open={!!leadDetailId} onOpenChange={() => setLeadDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <p className="font-medium">{selectedLead.name || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedLead.status as keyof typeof STATUS_CONFIG]?.color}>
                    {STATUS_CONFIG[selectedLead.status as keyof typeof STATUS_CONFIG]?.label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">E-mail</Label>
                  <p className="text-sm">{selectedLead.email || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Telefone</Label>
                  <p className="text-sm">{selectedLead.phone || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                  <p className="text-sm">{selectedLead.whatsapp || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Score</Label>
                  <p className="text-sm font-mono">{selectedLead.score || 0}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Origem</Label>
                <div className="flex gap-1.5 mt-1">
                  {selectedLead.source && <Badge variant="secondary">{selectedLead.source}</Badge>}
                  {selectedLead.utm_source && <Badge variant="outline">utm: {selectedLead.utm_source}</Badge>}
                  {selectedLead.utm_medium && <Badge variant="outline">{selectedLead.utm_medium}</Badge>}
                  {selectedLead.utm_campaign && <Badge variant="outline">{selectedLead.utm_campaign}</Badge>}
                </div>
              </div>
              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedLead.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedLead.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notas</Label>
                  <p className="text-sm mt-1">{selectedLead.notes}</p>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Capturado em {selectedLead.created_at && format(new Date(selectedLead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
