import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Video,
  ArrowLeft,
  Wand2,
  Users,
  Lock,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function StudioCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    max_participants: "10",
    is_private: false,
    default_layout: "grid",
  });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Get user's team
  const { data: teamMember } = useQuery({
    queryKey: ["user-team", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("illumina_team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  const createStudio = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!teamMember?.team_id) throw new Error("Equipe não encontrada");

      const { error } = await supabase
        .from("illumina_studios")
        .insert({
          team_id: teamMember.team_id,
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          max_participants: parseInt(data.max_participants),
          is_private: data.is_private,
          default_layout: data.default_layout,
          status: "active",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estúdio criado com sucesso!");
      navigate("/admin/conexao-studio/studios");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate key")) {
        toast.error("Este slug já está em uso. Escolha outro.");
      } else {
        toast.error("Erro ao criar estúdio: " + error.message);
      }
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!isSlugManuallyEdited) {
      setFormData((prev) => ({ ...prev, name, slug: generateSlug(name) }));
    }
  };

  const handleSlugChange = (slug: string) => {
    setIsSlugManuallyEdited(true);
    setFormData({ ...formData, slug: generateSlug(slug) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Preencha o nome e o slug do estúdio");
      return;
    }
    createStudio.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/conexao-studio/studios">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6" />
            Novo Estúdio
          </h1>
          <p className="text-muted-foreground">
            Crie um estúdio com link permanente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Configure o nome e identificador do seu estúdio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Estúdio *</Label>
              <Input
                id="name"
                placeholder="Ex: Podcast Semanal"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Link Permanente *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  /conexao-studio/studio/
                </span>
                <Input
                  id="slug"
                  placeholder="podcast-semanal"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Este link será usado para acessar o estúdio. Não pode ser alterado depois.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o propósito deste estúdio..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>
              Defina as opções de participação e layout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="max_participants">Máximo de Participantes</Label>
              <Select
                value={formData.max_participants}
                onValueChange={(value) => setFormData({ ...formData, max_participants: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 participantes</SelectItem>
                  <SelectItem value="4">4 participantes</SelectItem>
                  <SelectItem value="6">6 participantes</SelectItem>
                  <SelectItem value="8">8 participantes</SelectItem>
                  <SelectItem value="10">10 participantes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_layout">Layout Padrão</Label>
              <Select
                value={formData.default_layout}
                onValueChange={(value) => setFormData({ ...formData, default_layout: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grade</SelectItem>
                  <SelectItem value="spotlight">Spotlight</SelectItem>
                  <SelectItem value="pip">Picture-in-Picture</SelectItem>
                  <SelectItem value="side-by-side">Lado a Lado</SelectItem>
                  <SelectItem value="vertical">Vertical (9:16)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-3">
                {formData.is_private ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Globe className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Estúdio Privado</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_private 
                      ? "Apenas pessoas com convite podem entrar"
                      : "Qualquer pessoa com o link pode assistir"
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.is_private}
                onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/conexao-studio/studios">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={createStudio.isPending} className="gap-2">
            {createStudio.isPending ? (
              "Criando..."
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Criar Estúdio
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
