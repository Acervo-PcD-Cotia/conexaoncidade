import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Save,
  BookOpen,
  Calendar,
  Users,
  Trophy,
  Eye,
  AlertCircle,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  useDigitalEdition,
  useCreateDigitalEdition,
  useUpdateDigitalEdition,
} from "@/hooks/useDigitalEditions";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function EditionEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: edition, isLoading } = useDigitalEdition(id);
  const createEdition = useCreateDigitalEdition();
  const updateEdition = useUpdateDigitalEdition();

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  
  // Access control state
  const [tipoAcesso, setTipoAcesso] = useState<"comunidade" | "pontuacao">("comunidade");
  const [acessoLivreAte, setAcessoLivreAte] = useState("");
  const [pontuacaoMinima, setPontuacaoMinima] = useState(0);

  // Populate form when editing
  useEffect(() => {
    if (edition) {
      setTitle(edition.title);
      setSlug(edition.slug);
      setDescription(edition.description || "");
      setCoverImageUrl(edition.cover_image_url || "");
      setStatus((edition.status as "draft" | "published") || "draft");
      
      // Access control fields (using type assertion since they're new fields)
      const editionWithAccess = edition as any;
      setTipoAcesso(editionWithAccess.tipo_acesso || "comunidade");
      setAcessoLivreAte(editionWithAccess.acesso_livre_ate 
        ? format(new Date(editionWithAccess.acesso_livre_ate), "yyyy-MM-dd'T'HH:mm")
        : ""
      );
      setPontuacaoMinima(editionWithAccess.pontuacao_minima || 0);
    }
  }, [edition]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      const generatedSlug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generatedSlug);
    }
  }, [title, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Título e slug são obrigatórios.",
      });
      return;
    }

    const editionData: any = {
      title,
      slug,
      description: description || null,
      cover_image_url: coverImageUrl || null,
      status,
      tipo_acesso: tipoAcesso,
      pontuacao_minima: tipoAcesso === "pontuacao" ? pontuacaoMinima : 0,
      acesso_livre_ate: acessoLivreAte ? new Date(acessoLivreAte).toISOString() : null,
      ...(status === "published" && !edition?.published_at ? { published_at: new Date().toISOString() } : {}),
    };

    try {
      if (isEditing) {
        await updateEdition.mutateAsync({ id, ...editionData });
        toast({
          title: "Edição atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        await createEdition.mutateAsync(editionData);
        toast({
          title: "Edição criada",
          description: "A nova edição foi criada com sucesso.",
        });
        navigate("/spah/painel/editions");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a edição.",
      });
    }
  };

  const suggestFreeAccessDate = () => {
    const date = addDays(new Date(), 7);
    setAcessoLivreAte(format(date, "yyyy-MM-dd'T'23:59"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const getAccessPreviewText = () => {
    if (tipoAcesso === "comunidade") {
      return "Esta edição estará disponível para todos os membros da comunidade logados.";
    }
    
    let text = "";
    if (acessoLivreAte) {
      const freeDate = new Date(acessoLivreAte);
      text = `Esta edição será livre até ${format(freeDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}.`;
    } else {
      text = "Esta edição requer pontuação mínima para acesso.";
    }
    
    if (pontuacaoMinima > 0) {
      text += ` Após, usuários precisarão de ${pontuacaoMinima} pontos para acessar.`;
    }
    
    return text;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/spah/painel/editions")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Edição" : "Nova Edição Digital"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Atualize os dados da edição" : "Crie uma nova edição do portal"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Edição Especial - Janeiro 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="edicao-especial-janeiro-2026"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL: /edicao/{slug || "..."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição breve da edição..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Capa da Edição</Label>
                <ImageUploader
                  value={coverImageUrl}
                  onChange={setCoverImageUrl}
                  label="Capa da Edição (formato 3:4)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Regras de Acesso
              </CardTitle>
              <CardDescription>
                Configure quem pode acessar esta edição e quando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Access Type */}
              <div className="space-y-3">
                <Label>Tipo de Acesso</Label>
                <RadioGroup
                  value={tipoAcesso}
                  onValueChange={(v) => setTipoAcesso(v as "comunidade" | "pontuacao")}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="comunidade" id="comunidade" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="comunidade" className="cursor-pointer flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Apenas Comunidade
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Login na comunidade é suficiente para acessar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="pontuacao" id="pontuacao" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="pontuacao" className="cursor-pointer flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Com Pontuação
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Requer pontos mínimos após o período de acesso livre
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {tipoAcesso === "pontuacao" && (
                <>
                  <Separator />

                  {/* Free Access Period */}
                  <div className="space-y-2">
                    <Label htmlFor="acessoLivreAte" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Acesso Livre Até
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="acessoLivreAte"
                        type="datetime-local"
                        value={acessoLivreAte}
                        onChange={(e) => setAcessoLivreAte(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={suggestFreeAccessDate}>
                        +7 dias
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Período em que todos os membros da comunidade podem acessar sem pontuação
                    </p>
                  </div>

                  {/* Minimum Points */}
                  <div className="space-y-2">
                    <Label htmlFor="pontuacaoMinima" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Pontuação Mínima
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="pontuacaoMinima"
                        type="number"
                        min={0}
                        step={50}
                        value={pontuacaoMinima}
                        onChange={(e) => setPontuacaoMinima(parseInt(e.target.value) || 0)}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">pontos</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      💡 {Math.ceil(pontuacaoMinima / 10)} compartilhamentos ou {Math.ceil(pontuacaoMinima / 5)} comentários
                    </p>
                  </div>
                </>
              )}

              {/* Preview */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Prévia das regras</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getAccessPreviewText()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Card */}
          <Card>
            <CardHeader>
              <CardTitle>Publicação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="status" className="flex items-center gap-2">
                  {status === "published" ? (
                    <Unlock className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  Publicar
                </Label>
                <Switch
                  id="status"
                  checked={status === "published"}
                  onCheckedChange={(checked) => setStatus(checked ? "published" : "draft")}
                />
              </div>

              <Badge variant={status === "published" ? "default" : "secondary"}>
                {status === "published" ? "Publicado" : "Rascunho"}
              </Badge>

              <Separator />

              <Button type="submit" className="w-full" disabled={createEdition.isPending || updateEdition.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Salvar Alterações" : "Criar Edição"}
              </Button>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                Sobre Acesso Gamificado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                O acesso às edições digitais nunca é pago. Ele é controlado pelo 
                engajamento do usuário na comunidade.
              </p>
              <p>
                <strong>Tipo "Comunidade":</strong> Qualquer membro logado pode acessar.
              </p>
              <p>
                <strong>Tipo "Pontuação":</strong> Após o período livre, requer pontos 
                acumulados por compartilhamentos, comentários e outras ações.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
