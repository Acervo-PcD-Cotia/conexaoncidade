import { useState } from "react";
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BroadcastProgram, BroadcastChannel } from "@/hooks/useBroadcast";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export default function BroadcastPrograms() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<BroadcastProgram | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    channel_id: "",
    description: "",
    host_name: "",
    category: "",
    default_day_of_week: "",
    default_start_time: "",
    default_duration_minutes: 60,
    cover_image_url: "",
    is_active: true,
  });
  const queryClient = useQueryClient();

  const { data: channels } = useQuery({
    queryKey: ["broadcast-channels-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_channels")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as BroadcastChannel[];
    },
  });

  const { data: programs, isLoading } = useQuery({
    queryKey: ["broadcast-programs-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_programs")
        .select("*, channel:broadcast_channels(*)")
        .order("name");
      if (error) throw error;
      return data as BroadcastProgram[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        channel_id: data.channel_id || null,
        default_day_of_week: data.default_day_of_week ? parseInt(data.default_day_of_week) : null,
        default_start_time: data.default_start_time || null,
      };

      if (editingProgram) {
        const { error } = await supabase
          .from("broadcast_programs")
          .update(payload)
          .eq("id", editingProgram.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("broadcast_programs").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-programs"] });
      toast.success(editingProgram ? "Programa atualizado!" : "Programa criado!");
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao salvar programa");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("broadcast_programs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-programs"] });
      toast.success("Programa excluído!");
    },
    onError: () => {
      toast.error("Erro ao excluir programa");
    },
  });

  const resetForm = () => {
    setIsOpen(false);
    setEditingProgram(null);
    setFormData({
      name: "",
      slug: "",
      channel_id: "",
      description: "",
      host_name: "",
      category: "",
      default_day_of_week: "",
      default_start_time: "",
      default_duration_minutes: 60,
      cover_image_url: "",
      is_active: true,
    });
  };

  const openEdit = (program: BroadcastProgram) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      slug: program.slug,
      channel_id: program.channel_id || "",
      description: program.description || "",
      host_name: program.host_name || "",
      category: program.category || "",
      default_day_of_week: program.default_day_of_week?.toString() || "",
      default_start_time: program.default_start_time || "",
      default_duration_minutes: program.default_duration_minutes,
      cover_image_url: program.cover_image_url || "",
      is_active: program.is_active,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Preencha o nome do programa");
      return;
    }
    saveMutation.mutate({
      ...formData,
      slug: formData.slug || generateSlug(formData.name),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Programas</h1>
          <p className="text-muted-foreground">Gerencie a grade de programação</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Programa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProgram ? "Editar Programa" : "Novo Programa"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: editingProgram ? prev.slug : generateSlug(e.target.value),
                    }))
                  }
                  placeholder="Ex: Jornal da Manhã"
                />
              </div>

              <div className="space-y-2">
                <Label>Canal</Label>
                <Select
                  value={formData.channel_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, channel_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels?.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.type === "radio" ? "📻" : "📺"} {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="host_name">Apresentador</Label>
                <Input
                  id="host_name"
                  value={formData.host_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, host_name: e.target.value }))
                  }
                  placeholder="Nome do apresentador"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="Ex: Jornalismo, Entretenimento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descrição do programa..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dia Padrão</Label>
                  <Select
                    value={formData.default_day_of_week}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, default_day_of_week: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_start_time">Horário</Label>
                  <Input
                    id="default_start_time"
                    type="time"
                    value={formData.default_start_time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, default_start_time: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_duration_minutes">Duração (minutos)</Label>
                <Input
                  id="default_duration_minutes"
                  type="number"
                  value={formData.default_duration_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      default_duration_minutes: parseInt(e.target.value) || 60,
                    }))
                  }
                  min={15}
                  max={480}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Ativo</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {editingProgram ? "Salvar" : "Criar Programa"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Carregando...</p>
        ) : programs?.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            Nenhum programa cadastrado
          </p>
        ) : (
          programs?.map((program) => (
            <Card key={program.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <Badge variant={program.is_active ? "default" : "secondary"}>
                    {program.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription>
                  {program.channel?.name || "Sem canal"} • {program.host_name || "Sem apresentador"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {program.default_day_of_week !== null && program.default_start_time && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="w-4 h-4" />
                    {DAYS_OF_WEEK.find((d) => d.value === program.default_day_of_week)?.label} às{" "}
                    {program.default_start_time.slice(0, 5)} ({program.default_duration_minutes}min)
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {program.description || "Sem descrição"}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(program)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(program.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
