import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Plus, FileText, Eye, Edit, Trash2, Link2, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';

interface BioPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  logo_url?: string;
  background_color?: string;
  text_color?: string;
  is_active: boolean;
  created_at: string;
}

const emptyBioPage = {
  slug: '',
  title: '',
  description: '',
  logo_url: '',
  background_color: '#ffffff',
  text_color: '#000000',
};

export default function LinksBioBuilder() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<BioPage | null>(null);
  const [formData, setFormData] = useState(emptyBioPage);

  const { data: bioPages = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['bio-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bio_pages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BioPage[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('bio_pages').insert({
        ...data,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bio-pages'] });
      toast.success('Página bio criada!');
      setIsOpen(false);
      setFormData(emptyBioPage);
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bio_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bio-pages'] });
      toast.success('Página removida!');
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  const handleEdit = (page: BioPage) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      description: page.description || '',
      logo_url: page.logo_url || '',
      background_color: page.background_color || '#ffffff',
      text_color: page.text_color || '#000000',
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/bio/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Páginas Bio</h1>
          <p className="text-muted-foreground">
            Crie páginas personalizadas estilo "link-in-bio"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/spah/painel/links">
              <Link2 className="mr-2 h-4 w-4" />
              Voltar para Links
            </Link>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button onClick={() => { setEditingPage(null); setFormData(emptyBioPage); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Página
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{editingPage ? 'Editar Página' : 'Nova Página Bio'}</SheetTitle>
                <SheetDescription>
                  Configure sua página de links personalizada
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/bio/</span>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="minha-pagina"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Minha Página de Links"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Uma breve descrição..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL do Logo</Label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={formData.background_color}
                        onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                    {editingPage ? 'Salvar Alterações' : 'Criar Página'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AdminLoadingState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Carregando páginas bio..."
      >
        {bioPages.length === 0 ? (
          <AdminEmptyState
            icon={FileText}
            title="Nenhuma página bio"
            description="Crie páginas personalizadas para compartilhar seus links em um só lugar."
            action={{ label: 'Nova Página', onClick: () => setIsOpen(true) }}
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Página</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="w-[150px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bioPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {page.logo_url ? (
                          <img src={page.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{page.title}</p>
                          {page.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {page.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">/bio/{page.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.is_active ? 'default' : 'secondary'}>
                        {page.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(page.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleCopyLink(page.slug)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/bio/${page.slug}`} target="_blank" rel="noopener">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Remover esta página?')) {
                              deleteMutation.mutate(page.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </AdminLoadingState>
    </div>
  );
}
