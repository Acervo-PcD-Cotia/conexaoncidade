import { useState } from "react";
import {
  useCreateProofChannel,
  useUpdateProofChannel,
  useDeleteProofChannel,
  useApplyDefaultChannels,
} from "@/hooks/useCampaignProofChannels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Wand2, Pencil } from "lucide-react";
import type { CampaignProofFull, CampaignProofChannel } from "@/types/campaign-proofs";

interface ProofChannelsListProps {
  proof: CampaignProofFull;
}

export default function ProofChannelsList({ proof }: ProofChannelsListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<CampaignProofChannel | null>(null);
  const [formData, setFormData] = useState({
    channel_name: "",
    channel_value: "",
    channel_metric: "",
  });

  const createMutation = useCreateProofChannel();
  const updateMutation = useUpdateProofChannel();
  const deleteMutation = useDeleteProofChannel();
  const applyDefaultMutation = useApplyDefaultChannels();

  const openDialog = (channel?: CampaignProofChannel) => {
    if (channel) {
      setEditingChannel(channel);
      setFormData({
        channel_name: channel.channel_name,
        channel_value: channel.channel_value || "",
        channel_metric: channel.channel_metric || "",
      });
    } else {
      setEditingChannel(null);
      setFormData({ channel_name: "", channel_value: "", channel_metric: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.channel_name.trim()) return;

    if (editingChannel) {
      updateMutation.mutate(
        { id: editingChannel.id, ...formData },
        { onSuccess: () => setIsDialogOpen(false) }
      );
    } else {
      createMutation.mutate(
        {
          campaign_proof_id: proof.id,
          ...formData,
          sort_order: proof.channels.length,
        },
        { onSuccess: () => setIsDialogOpen(false) }
      );
    }
  };

  const handleDelete = (channel: CampaignProofChannel) => {
    deleteMutation.mutate({ id: channel.id, campaignProofId: proof.id });
  };

  const handleApplyDefault = () => {
    applyDefaultMutation.mutate(proof.id);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Canais de Veiculação</CardTitle>
            <CardDescription>
              Defina os canais onde a campanha foi veiculada
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleApplyDefault} disabled={applyDefaultMutation.isPending}>
              <Wand2 className="mr-2 h-4 w-4" />
              Modelo Padrão
            </Button>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {proof.channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhum canal adicionado ainda
            </p>
            <Button variant="outline" onClick={handleApplyDefault}>
              <Wand2 className="mr-2 h-4 w-4" />
              Aplicar Modelo Padrão Conexão
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal</TableHead>
                <TableHead>Valor/Descrição</TableHead>
                <TableHead>Métrica</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proof.channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="font-medium">{channel.channel_name}</TableCell>
                  <TableCell>{channel.channel_value || "-"}</TableCell>
                  <TableCell>{channel.channel_metric || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(channel)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(channel)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChannel ? "Editar Canal" : "Adicionar Canal"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do canal de veiculação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="channel_name">Nome do Canal *</Label>
              <Input
                id="channel_name"
                value={formData.channel_name}
                onChange={(e) => setFormData({ ...formData, channel_name: e.target.value })}
                placeholder="Ex: Site Principal, Newsletter, Redes Sociais"
              />
            </div>
            <div>
              <Label htmlFor="channel_value">Valor/Descrição</Label>
              <Input
                id="channel_value"
                value={formData.channel_value}
                onChange={(e) => setFormData({ ...formData, channel_value: e.target.value })}
                placeholder="Ex: Banner destaque home"
              />
            </div>
            <div>
              <Label htmlFor="channel_metric">Métrica</Label>
              <Input
                id="channel_metric"
                value={formData.channel_metric}
                onChange={(e) => setFormData({ ...formData, channel_metric: e.target.value })}
                placeholder="Ex: Impressões, Cliques, Alcance"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !formData.channel_name.trim()}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
