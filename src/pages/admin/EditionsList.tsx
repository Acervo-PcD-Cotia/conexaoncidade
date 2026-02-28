import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, BookOpen, MoreVertical, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDigitalEditions, useDeleteDigitalEdition, type DigitalEdition } from '@/hooks/useDigitalEditions';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'secondary' },
  published: { label: 'Publicada', variant: 'default' },
  archived: { label: 'Arquivada', variant: 'outline' },
};

function EditionCard({ edition, onDelete }: { edition: DigitalEdition; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  const status = statusConfig[edition.status || 'draft'];

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <Badge variant={status.variant}>{status.label}</Badge>
            <CardTitle className="text-lg line-clamp-1">{edition.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {edition.description || 'Sem descrição'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/spah/painel/editions/${edition.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {edition.status === 'published' && (
                <DropdownMenuItem onClick={() => window.open(`/edicao/${edition.slug}`, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Página
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(edition.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{edition.view_count || 0} visualizações</span>
          </div>
          <span>
            {edition.published_at
              ? format(new Date(edition.published_at), "dd/MM/yyyy", { locale: ptBR })
              : format(new Date(edition.created_at || ''), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EditionsList() {
  const [tab, setTab] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: editions = [], isLoading } = useDigitalEditions(tab === 'all' ? undefined : tab);
  const deleteEdition = useDeleteDigitalEdition();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEdition.mutateAsync(deleteId);
      toast.success('Edição excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir edição');
    }
    setDeleteId(null);
  };

  const stats = {
    total: editions.length,
    published: editions.filter(e => e.status === 'published').length,
    draft: editions.filter(e => e.status === 'draft').length,
    archived: editions.filter(e => e.status === 'archived').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edição Digital</h1>
          <p className="text-muted-foreground">Organize suas notícias em edições periódicas</p>
        </div>
        <Button asChild>
          <Link to="/spah/painel/editions/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Edição
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Publicadas</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.published}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rascunhos</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.draft}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Arquivadas</CardDescription>
            <CardTitle className="text-2xl text-muted-foreground">{stats.archived}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="published">Publicadas</TabsTrigger>
          <TabsTrigger value="draft">Rascunhos</TabsTrigger>
          <TabsTrigger value="archived">Arquivadas</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-5 w-20 bg-muted rounded" />
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-1/2 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : editions.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma edição encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira edição digital para começar
              </p>
              <Button asChild>
                <Link to="/spah/painel/editions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Edição
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editions.map(edition => (
                <EditionCard key={edition.id} edition={edition} onDelete={setDeleteId} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir edição?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os itens da edição serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
