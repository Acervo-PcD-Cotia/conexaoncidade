import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignRoutes } from '@/lib/campaignRoutes';
import { Plus, Search, Filter, LayoutGrid, List, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { CampaignCard } from '@/components/admin/campaigns/CampaignCard';
import { 
  useCampaignsUnified, 
  useDeleteCampaignUnified, 
  useUpdateCampaignUnified 
} from '@/hooks/useCampaignsUnified';
import type { CampaignStatus, ChannelType } from '@/types/campaigns-unified';

export default function CampaignsUnified() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelType | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: campaigns, isLoading } = useCampaignsUnified({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    channel: channelFilter === 'all' ? undefined : channelFilter,
  });

  const deleteMutation = useDeleteCampaignUnified();
  const updateMutation = useUpdateCampaignUnified();

  const handleEdit = (id: string) => {
    navigate(campaignRoutes.edit(id));
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleToggleStatus = (id: string, status: 'active' | 'paused') => {
    updateMutation.mutate({ id, data: { status } });
  };

  const handleViewMetrics = (id: string) => {
    navigate(campaignRoutes.metrics(id));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campanhas Unificadas</h1>
          <p className="text-muted-foreground">
            Gerencie campanhas que rodam em Ads, Publidoor e WebStories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(campaignRoutes.tutorial())}>
            <BookOpen className="h-4 w-4 mr-2" />
            Tutorial
          </Button>
          <Button onClick={() => navigate(campaignRoutes.new())}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou anunciante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="paused">Pausada</SelectItem>
            <SelectItem value="ended">Encerrada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelType | 'all')}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <LayoutGrid className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ads">Ads</SelectItem>
            <SelectItem value="publidoor">Publidoor</SelectItem>
            <SelectItem value="webstories">WebStories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : campaigns?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <List className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma campanha encontrada</h3>
          <p className="text-muted-foreground mt-1">
            {search || statusFilter !== 'all' || channelFilter !== 'all'
              ? 'Tente ajustar os filtros'
              : 'Crie sua primeira campanha unificada'}
          </p>
          {!search && statusFilter === 'all' && channelFilter === 'all' && (
            <Button className="mt-4" onClick={() => navigate(campaignRoutes.new())}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Campanha
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns?.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              onToggleStatus={handleToggleStatus}
              onViewMetrics={handleViewMetrics}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A campanha e todos os seus dados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
