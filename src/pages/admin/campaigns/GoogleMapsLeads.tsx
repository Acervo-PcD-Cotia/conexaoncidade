import { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  XCircle,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  Image
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useCampaignLeads, 
  useCampaignStats, 
  useUpdateLeadStatus, 
  useLeadPhotos,
  CampaignLead 
} from '@/hooks/useCampaignLeads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { utils, writeFile } from 'xlsx';

const priorityConfig = {
  high: { label: 'Alta', color: 'bg-red-500', icon: AlertCircle },
  medium: { label: 'Média', color: 'bg-amber-500', icon: Clock },
  low: { label: 'Baixa', color: 'bg-green-500', icon: CheckCircle },
};

const statusConfig = {
  received: { label: 'Recebido', color: 'bg-blue-500' },
  in_progress: { label: 'Em Execução', color: 'bg-amber-500' },
  completed: { label: 'Concluído', color: 'bg-green-500' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500' },
};

const categoryLabels: Record<string, string> = {
  restaurant: 'Restaurante',
  commerce: 'Comércio',
  service: 'Serviço',
  health: 'Saúde',
  education: 'Educação',
  beauty: 'Beleza',
  automotive: 'Automotivo',
  other: 'Outro',
};

function LeadDetailsDialog({ lead }: { lead: CampaignLead }) {
  const { data: photos, isLoading: loadingPhotos } = useLeadPhotos(lead.id);
  const updateStatus = useUpdateLeadStatus();
  const [notes, setNotes] = useState(lead.notes || '');
  const [newStatus, setNewStatus] = useState(lead.status);

  const handleUpdateStatus = () => {
    updateStatus.mutate({
      leadId: lead.id,
      status: newStatus,
      notes,
    });
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {lead.business_name}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Info Section */}
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs">Categoria</Label>
            <p className="font-medium">{categoryLabels[lead.business_category] || lead.business_category}</p>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Endereço</Label>
            <p className="font-medium">{lead.address}</p>
            <p className="text-sm text-muted-foreground">{lead.city}, {lead.state}</p>
          </div>

          <div className="flex gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">WhatsApp</Label>
              <a href={`https://wa.me/55${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-1 text-primary hover:underline">
                <Phone className="h-3 w-3" />
                {lead.whatsapp}
              </a>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-primary hover:underline">
                <Mail className="h-3 w-3" />
                {lead.email}
              </a>
            </div>
          </div>

          {lead.google_maps_link && (
            <div>
              <Label className="text-muted-foreground text-xs">Google Maps</Label>
              <a href={lead.google_maps_link} target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="h-3 w-3" />
                Ver no mapa
              </a>
            </div>
          )}

          {lead.business_description && (
            <div>
              <Label className="text-muted-foreground text-xs">Descrição</Label>
              <p className="text-sm">{lead.business_description}</p>
            </div>
          )}
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge className={priorityConfig[lead.priority].color}>
              {priorityConfig[lead.priority].label}
            </Badge>
            <Badge variant="outline">{lead.estimated_points} pontos</Badge>
          </div>

          <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
            <p><strong>Google Maps:</strong> {lead.has_google_maps === 'yes' ? 'Sim' : lead.has_google_maps === 'no' ? 'Não' : 'Não sabe'}</p>
            <p><strong>Fotos:</strong> {lead.has_photos === 'yes' ? 'Sim' : lead.has_photos === 'few' ? 'Poucas' : 'Não'}</p>
            <p><strong>Responde avaliações:</strong> {lead.responds_reviews === 'always' ? 'Sempre' : lead.responds_reviews === 'sometimes' ? 'Às vezes' : 'Nunca'}</p>
            <p><strong>Horário correto:</strong> {lead.correct_hours === 'yes' ? 'Sim' : lead.correct_hours === 'no' ? 'Não' : 'Não sabe'}</p>
          </div>

          <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
            <p className="font-medium mb-2">Autorizações:</p>
            <p>✓ Avaliação: {lead.authorized_review ? 'Sim' : 'Não'}</p>
            <p>✓ Fotos: {lead.authorized_photos ? 'Sim' : 'Não'}</p>
            <p>✓ Correções: {lead.authorized_corrections ? 'Sim' : 'Não'}</p>
            <p>✓ Guia Local: {lead.authorized_local_guide ? 'Sim' : 'Não'}</p>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as CampaignLead['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="received">Recebido</SelectItem>
                <SelectItem value="in_progress">Em Execução</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione notas sobre este lead..."
            />
          </div>

          <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending}>
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Photos Section */}
      {(photos?.length ?? 0) > 0 && (
        <div className="mt-6">
          <Label className="text-muted-foreground text-xs mb-2 block">Fotos Enviadas</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {loadingPhotos ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))
            ) : (
              photos?.map((photo) => (
                <a 
                  key={photo.id} 
                  href={photo.photo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors"
                >
                  <img 
                    src={photo.photo_url} 
                    alt={photo.photo_type}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </DialogContent>
  );
}

export default function GoogleMapsLeads() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  const { data: leads, isLoading } = useCampaignLeads({
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    search: filters.search || undefined,
  });

  const { data: stats } = useCampaignStats();

  const handleExport = () => {
    if (!leads) return;

    const exportData = leads.map(lead => ({
      'Nome do Negócio': lead.business_name,
      'Categoria': categoryLabels[lead.business_category] || lead.business_category,
      'Endereço': lead.address,
      'Cidade': lead.city,
      'WhatsApp': lead.whatsapp,
      'Email': lead.email,
      'Status': statusConfig[lead.status].label,
      'Prioridade': priorityConfig[lead.priority].label,
      'Pontos': lead.estimated_points,
      'Data': format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Leads');
    writeFile(wb, `leads-google-maps-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Campanha Google Maps
            </h1>
            <p className="text-muted-foreground">Gerencie os leads da campanha de visibilidade local</p>
          </div>

          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
              <p className="text-sm text-muted-foreground">Total de Leads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-500">{stats?.received ?? 0}</div>
              <p className="text-sm text-muted-foreground">Aguardando</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-500">{stats?.in_progress ?? 0}</div>
              <p className="text-sm text-muted-foreground">Em Execução</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">{stats?.completed ?? 0}</div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                />
              </div>

              <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="received">Recebido</SelectItem>
                  <SelectItem value="in_progress">Em Execução</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(v) => setFilters(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Prioridade</th>
                    <th className="text-left p-4 font-medium">Negócio</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">Categoria</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium hidden sm:table-cell">Pontos</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">Data</th>
                    <th className="text-right p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                        <td className="p-4"><Skeleton className="h-6 w-32" /></td>
                        <td className="p-4 hidden md:table-cell"><Skeleton className="h-6 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-6 w-24" /></td>
                        <td className="p-4 hidden sm:table-cell"><Skeleton className="h-6 w-12" /></td>
                        <td className="p-4 hidden lg:table-cell"><Skeleton className="h-6 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : leads?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        Nenhum lead encontrado
                      </td>
                    </tr>
                  ) : (
                    leads?.map((lead) => {
                      const PriorityIcon = priorityConfig[lead.priority].icon;
                      return (
                        <tr key={lead.id} className="border-b hover:bg-muted/30">
                          <td className="p-4">
                            <Badge className={priorityConfig[lead.priority].color}>
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {priorityConfig[lead.priority].label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{lead.business_name}</div>
                            <div className="text-sm text-muted-foreground">{lead.city}</div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            {categoryLabels[lead.business_category] || lead.business_category}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={`${statusConfig[lead.status].color} text-white`}>
                              {statusConfig[lead.status].label}
                            </Badge>
                          </td>
                          <td className="p-4 hidden sm:table-cell font-medium">
                            {lead.estimated_points} pts
                          </td>
                          <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                            {format(new Date(lead.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                          </td>
                          <td className="p-4 text-right">
                            <Dialog key={lead.id}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <LeadDetailsDialog lead={lead} />
                            </Dialog>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
