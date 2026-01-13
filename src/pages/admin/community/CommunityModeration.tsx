import { useState } from "react";
import { 
  AlertTriangle, 
  Check, 
  X, 
  MessageSquare,
  User,
  Flag,
  Ban,
  Clock,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  post_id: string | null;
  comment_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_name?: string;
  reported_name?: string;
}

interface Penalty {
  id: string;
  user_id: string;
  penalty_type: string;
  reason: string;
  applied_by: string | null;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  user_name?: string;
  applied_by_name?: string;
}

export default function CommunityModeration() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [penaltyType, setPenaltyType] = useState<string>("");
  const [actionNote, setActionNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["community-reports", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("community_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get unique user IDs
      const userIds = new Set<string>();
      data?.forEach((r) => {
        if (r.reporter_id) userIds.add(r.reporter_id);
        if (r.reported_user_id) userIds.add(r.reported_user_id);
      });

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      return data?.map((r) => ({
        ...r,
        reporter_name: profileMap.get(r.reporter_id) || "Usuário",
        reported_name: profileMap.get(r.reported_user_id) || "Usuário",
      })) as Report[];
    },
  });

  // Fetch pending count
  const { data: pendingCount } = useQuery({
    queryKey: ["community-reports-pending-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("community_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch penalties
  const { data: penalties, isLoading: penaltiesLoading } = useQuery({
    queryKey: ["community-penalties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_penalties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get unique user IDs
      const userIds = new Set<string>();
      data?.forEach((p) => {
        if (p.user_id) userIds.add(p.user_id);
        if (p.applied_by) userIds.add(p.applied_by);
      });

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      return data?.map((p) => ({
        ...p,
        user_name: profileMap.get(p.user_id) || "Usuário",
        applied_by_name: p.applied_by ? profileMap.get(p.applied_by) || "Admin" : "Admin",
      })) as Penalty[];
    },
  });

  // Dismiss report mutation
  const dismissReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from("community_reports")
        .update({ 
          status: "dismissed",
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-reports"] });
      queryClient.invalidateQueries({ queryKey: ["community-reports-pending-count"] });
      toast({ title: "Denúncia descartada" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao descartar denúncia" });
    },
  });

  // Apply penalty mutation
  const applyPenalty = useMutation({
    mutationFn: async () => {
      if (!selectedReport || !penaltyType) return;

      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      // Calculate end date based on penalty type
      let endsAt = null;
      if (penaltyType === "mute") {
        endsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h
      } else if (penaltyType === "suspend") {
        endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
      }

      // Create penalty
      const { error: penaltyError } = await supabase
        .from("community_penalties")
        .insert({
          user_id: selectedReport.reported_user_id,
          penalty_type: penaltyType,
          reason: actionNote || selectedReport.reason,
          applied_by: userId,
          report_id: selectedReport.id,
          starts_at: new Date().toISOString(),
          ends_at: endsAt,
          is_active: true,
        });
      if (penaltyError) throw penaltyError;

      // Update report status
      const { error: reportError } = await supabase
        .from("community_reports")
        .update({
          status: "resolved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
          action_taken: penaltyType,
          notes: actionNote,
        })
        .eq("id", selectedReport.id);
      if (reportError) throw reportError;

      // If ban or suspend, update community_members
      if (penaltyType === "ban" || penaltyType === "suspend") {
        const { error: memberError } = await supabase
          .from("community_members")
          .update({
            is_suspended: true,
            suspended_reason: actionNote || selectedReport.reason,
            suspended_until: endsAt,
          })
          .eq("user_id", selectedReport.reported_user_id);
        if (memberError) throw memberError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-reports"] });
      queryClient.invalidateQueries({ queryKey: ["community-penalties"] });
      queryClient.invalidateQueries({ queryKey: ["community-reports-pending-count"] });
      toast({ title: "Penalidade aplicada com sucesso" });
      setActionDialogOpen(false);
      setSelectedReport(null);
      setPenaltyType("");
      setActionNote("");
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao aplicar penalidade" });
    },
  });

  // Remove penalty mutation
  const removePenalty = useMutation({
    mutationFn: async (penaltyId: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { data: penalty, error: fetchError } = await supabase
        .from("community_penalties")
        .select("user_id")
        .eq("id", penaltyId)
        .single();
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("community_penalties")
        .update({ 
          is_active: false,
          lifted_at: new Date().toISOString(),
          lifted_by: userId,
        })
        .eq("id", penaltyId);
      if (error) throw error;

      // Remove suspension from member
      if (penalty) {
        await supabase
          .from("community_members")
          .update({
            is_suspended: false,
            suspended_reason: null,
            suspended_until: null,
          })
          .eq("user_id", penalty.user_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-penalties"] });
      toast({ title: "Penalidade removida" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao remover penalidade" });
    },
  });

  const getTypeBadge = (report: Report) => {
    if (report.post_id) {
      return <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1" />Post</Badge>;
    }
    if (report.comment_id) {
      return <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1" />Comentário</Badge>;
    }
    return <Badge variant="outline"><User className="h-3 w-3 mr-1" />Usuário</Badge>;
  };

  const getPenaltyBadge = (type: string) => {
    switch (type) {
      case "warning":
        return <Badge variant="secondary">Advertência</Badge>;
      case "mute":
        return <Badge className="bg-yellow-100 text-yellow-800">Silenciado</Badge>;
      case "suspend":
        return <Badge className="bg-orange-100 text-orange-800">Suspenso</Badge>;
      case "ban":
        return <Badge variant="destructive">Banido</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const openActionDialog = (report: Report) => {
    setSelectedReport(report);
    setActionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Moderação</h1>
          <p className="text-muted-foreground">Revise denúncias e gerencie penalidades</p>
        </div>
        {pendingCount && pendingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {pendingCount} pendente(s)
          </Badge>
        )}
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">
            <Flag className="h-4 w-4 mr-2" />
            Denúncias
            {pendingCount && pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="penalties">
            <Ban className="h-4 w-4 mr-2" />
            Penalidades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="resolved">Resolvidas</SelectItem>
                <SelectItem value="dismissed">Descartadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reports?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">Nenhuma denúncia {statusFilter === "pending" ? "pendente" : ""}</p>
              </CardContent>
            </Card>
          ) : (
            reports?.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        report.status === "pending" ? "bg-red-100" : "bg-gray-100"
                      }`}>
                        <AlertTriangle className={`h-5 w-5 ${
                          report.status === "pending" ? "text-red-600" : "text-gray-600"
                        }`} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getTypeBadge(report)}
                          <Badge variant="destructive">{report.reason}</Badge>
                          {report.status === "pending" ? (
                            <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
                          ) : report.status === "resolved" ? (
                            <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Resolvido</Badge>
                          ) : (
                            <Badge variant="outline"><X className="h-3 w-3 mr-1" />Descartado</Badge>
                          )}
                        </div>
                        
                        {report.description && (
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            "{report.description}"
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Denunciado: <span className="font-medium text-foreground">
                              {report.reported_name}
                            </span>
                          </span>
                          <span>
                            Por: <span className="font-medium text-foreground">
                              {report.reporter_name}
                            </span>
                          </span>
                          <span>
                            {format(new Date(report.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {report.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-gray-600"
                          onClick={() => dismissReport.mutate(report.id)}
                          disabled={dismissReport.isPending}
                        >
                          {dismissReport.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Descartar
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openActionDialog(report)}>
                          <Ban className="h-4 w-4 mr-1" />
                          Aplicar Ação
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="penalties" className="space-y-4">
          {penaltiesLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : penalties?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">Nenhuma penalidade registrada</p>
              </CardContent>
            </Card>
          ) : (
            penalties?.map((penalty) => (
              <Card key={penalty.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {(penalty.user_name || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{penalty.user_name}</span>
                          {getPenaltyBadge(penalty.penalty_type)}
                          {penalty.is_active ? (
                            <Badge variant="outline" className="text-red-600 border-red-600">Ativo</Badge>
                          ) : (
                            <Badge variant="outline">Expirado</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{penalty.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Aplicado por {penalty.applied_by_name} em {format(new Date(penalty.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    {penalty.is_active && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removePenalty.mutate(penalty.id)}
                        disabled={removePenalty.isPending}
                      >
                        {removePenalty.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Remover Penalidade"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar Penalidade</DialogTitle>
            <DialogDescription>
              Escolha a ação a ser tomada contra o usuário {selectedReport?.reported_name || ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Penalidade</label>
              <Select value={penaltyType} onValueChange={setPenaltyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Advertência</SelectItem>
                  <SelectItem value="mute">Silenciar (24h)</SelectItem>
                  <SelectItem value="suspend">Suspender (7 dias)</SelectItem>
                  <SelectItem value="ban">Banir Permanentemente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Textarea 
                placeholder="Descreva o motivo da ação..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => applyPenalty.mutate()}
              disabled={!penaltyType || applyPenalty.isPending}
            >
              {applyPenalty.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Aplicar Penalidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}