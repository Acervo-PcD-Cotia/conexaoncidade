/**
 * Guia Comercial - Leads Management Page
 * For business owners to manage incoming leads
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBusinessLeads, useUpdateLeadStatus, useMyBusinesses } from "@/hooks/useGuiaComercial";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  formatWhatsAppUrl,
  formatPhoneUrl,
  type BusinessLead,
  type LeadStatus,
} from "@/types/guia-comercial";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function GuiaAnuncianteLeads() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [businessFilter, setBusinessFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);

  const { data: leads, isLoading } = useBusinessLeads();
  const { data: businesses } = useMyBusinesses();
  const updateStatus = useUpdateLeadStatus();

  const filteredLeads = leads?.filter((lead) => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (businessFilter !== 'all' && lead.business_id !== businessFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.message?.toLowerCase().includes(query)
      );
    }
    return true;
  }) ?? [];

  const handleUpdateStatus = (id: string, status: LeadStatus, notes?: string) => {
    updateStatus.mutate({ id, status, notes });
    setSelectedLead(null);
  };

  return (
    <>
      <Helmet>
        <title>Gerenciar Leads | Guia Comercial</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/guia/anunciante">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Leads</h1>
            <p className="text-muted-foreground">
              {leads?.length ?? 0} leads recebidos
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="new">Novos</SelectItem>
                  <SelectItem value="contacted">Contatados</SelectItem>
                  <SelectItem value="converted">Convertidos</SelectItem>
                  <SelectItem value="lost">Perdidos</SelectItem>
                </SelectContent>
              </Select>

              {businesses && businesses.length > 1 && (
                <Select value={businessFilter} onValueChange={setBusinessFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {businesses.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSelect={() => setSelectedLead(lead)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lead Detail Dialog */}
      <LeadDetailDialog
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={updateStatus.isPending}
      />
    </>
  );
}

// ========================
// COMPONENTS
// ========================

function LeadCard({
  lead,
  onSelect,
}: {
  lead: BusinessLead;
  onSelect: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{lead.name}</h3>
              <Badge className={LEAD_STATUS_COLORS[lead.status]}>
                {LEAD_STATUS_LABELS[lead.status]}
              </Badge>
              {lead.urgency === 'high' && (
                <Badge variant="destructive">Urgente</Badge>
              )}
            </div>

            {lead.service_needed && (
              <p className="text-sm font-medium text-primary mb-1">
                {lead.service_needed}
              </p>
            )}

            {lead.message && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {lead.message}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {lead.whatsapp && (
                <a
                  href={formatWhatsAppUrl(lead.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-4 w-4" />
                  {lead.whatsapp}
                </a>
              )}
              {lead.phone && (
                <a
                  href={formatPhoneUrl(lead.phone)}
                  className="flex items-center gap-1 hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-4 w-4" />
                  {lead.phone}
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1 hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="h-4 w-4" />
                  {lead.email}
                </a>
              )}
            </div>
          </div>

          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1 justify-end mb-1">
              <Calendar className="h-4 w-4" />
              {new Date(lead.created_at).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Clock className="h-4 w-4" />
              {new Date(lead.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeadDetailDialog({
  lead,
  onClose,
  onUpdateStatus,
  isUpdating,
}: {
  lead: BusinessLead | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: LeadStatus, notes?: string) => void;
  isUpdating: boolean;
}) {
  const [notes, setNotes] = useState(lead?.notes ?? "");

  if (!lead) return null;

  return (
    <Dialog open={!!lead} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead.name}</DialogTitle>
          <DialogDescription>
            Lead recebido em {new Date(lead.created_at).toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Status atual</label>
              <Badge className={`mt-1 ${LEAD_STATUS_COLORS[lead.status]}`}>
                {LEAD_STATUS_LABELS[lead.status]}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Urgência</label>
              <p className="text-sm capitalize">{lead.urgency || 'Normal'}</p>
            </div>
          </div>

          {lead.service_needed && (
            <div>
              <label className="text-sm font-medium">Serviço desejado</label>
              <p className="text-sm">{lead.service_needed}</p>
            </div>
          )}

          {lead.message && (
            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <p className="text-sm bg-muted p-3 rounded-md">{lead.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {lead.whatsapp && (
              <Button variant="outline" className="w-full" asChild>
                <a
                  href={formatWhatsAppUrl(lead.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
            {lead.phone && (
              <Button variant="outline" className="w-full" asChild>
                <a href={formatPhoneUrl(lead.phone)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </a>
              </Button>
            )}
            {lead.email && (
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Anotações</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione anotações sobre este lead..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {lead.status === 'new' && (
            <Button
              variant="outline"
              onClick={() => onUpdateStatus(lead.id, 'contacted', notes)}
              disabled={isUpdating}
            >
              <Clock className="h-4 w-4 mr-2" />
              Marcar como Contatado
            </Button>
          )}
          {(lead.status === 'new' || lead.status === 'contacted') && (
            <>
              <Button
                variant="default"
                onClick={() => onUpdateStatus(lead.id, 'converted', notes)}
                disabled={isUpdating}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Convertido
              </Button>
              <Button
                variant="destructive"
                onClick={() => onUpdateStatus(lead.id, 'lost', notes)}
                disabled={isUpdating}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Perdido
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
