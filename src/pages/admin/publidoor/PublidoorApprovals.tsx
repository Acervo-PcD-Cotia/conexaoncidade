import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Clock, MessageSquare, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePublidoorItems, useCreatePublidoorApproval, usePublidoorApprovals } from "@/hooks/usePublidoor";
import { PUBLIDOOR_STATUS_LABELS, PUBLIDOOR_TYPE_LABELS, PublidoorApprovalAction } from "@/types/publidoor";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ACTION_ICONS: Record<PublidoorApprovalAction, React.ReactNode> = {
  submitted: <Send className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
  revision_requested: <MessageSquare className="h-4 w-4 text-amber-500" />,
};

const ACTION_LABELS: Record<PublidoorApprovalAction, string> = {
  submitted: "Enviado para análise",
  approved: "Aprovado",
  rejected: "Rejeitado",
  revision_requested: "Revisão solicitada",
};

export default function PublidoorApprovals() {
  const { data: items, isLoading: itemsLoading } = usePublidoorItems("review");
  const createApprovalMutation = useCreatePublidoorApproval();

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{ id: string; action: PublidoorApprovalAction } | null>(null);
  const [comment, setComment] = useState("");

  const handleAction = async () => {
    if (!actionDialog) return;
    await createApprovalMutation.mutateAsync({
      publidoor_id: actionDialog.id,
      action: actionDialog.action,
      comment: comment || undefined,
    });
    setActionDialog(null);
    setComment("");
  };

  const pendingItems = items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aprovações</h1>
        <p className="text-muted-foreground">
          Revise e aprove Publidoors antes da publicação
        </p>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Aguardando Aprovação
              </CardTitle>
              <CardDescription>
                {pendingItems.length} Publidoor(s) em análise
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : pendingItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Nenhum Publidoor aguardando aprovação</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    {item.media_url ? (
                      <img
                        src={item.media_url}
                        alt={item.internal_name}
                        className="h-16 w-24 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-24 bg-muted rounded flex items-center justify-center">
                        <Eye className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.internal_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {PUBLIDOOR_TYPE_LABELS[item.type]}
                        {item.advertiser && ` • ${item.advertiser.company_name}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enviado em {format(new Date(item.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionDialog({ id: item.id, action: "revision_requested" })}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Solicitar Ajustes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setActionDialog({ id: item.id, action: "rejected" })}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setActionDialog({ id: item.id, action: "approved" })}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Flow Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Fluxo de Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between max-w-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-muted-foreground/20 flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Rascunho</p>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <Eye className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium">Em Análise</p>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium">Aprovado</p>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Publicado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.action === "approved" && "Aprovar Publidoor"}
              {actionDialog?.action === "rejected" && "Rejeitar Publidoor"}
              {actionDialog?.action === "revision_requested" && "Solicitar Ajustes"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.action === "approved" &&
                "O Publidoor será aprovado e poderá ser publicado."}
              {actionDialog?.action === "rejected" &&
                "O Publidoor será rejeitado e retornará como rascunho."}
              {actionDialog?.action === "revision_requested" &&
                "O Publidoor retornará ao criador para ajustes."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Comentário (opcional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAction}
              disabled={createApprovalMutation.isPending}
              className={
                actionDialog?.action === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : actionDialog?.action === "rejected"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {actionDialog?.action === "approved" && "Aprovar"}
              {actionDialog?.action === "rejected" && "Rejeitar"}
              {actionDialog?.action === "revision_requested" && "Solicitar Ajustes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
