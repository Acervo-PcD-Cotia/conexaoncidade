import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, X, Eye, Search, Package, Clock, MapPin, DollarSign 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useAdminClassifieds, 
  useApproveClassified, 
  useRejectClassified,
  CLASSIFIED_CATEGORIES,
  Classified 
} from "@/hooks/useClassifieds";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  approved: { label: "Aprovado", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
  sold: { label: "Vendido", variant: "outline" },
  expired: { label: "Expirado", variant: "outline" },
};

export default function ClassifiedsAdmin() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedClassified, setSelectedClassified] = useState<Classified | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: classifieds, isLoading } = useAdminClassifieds(statusFilter === 'all' ? undefined : statusFilter);
  const approveClassified = useApproveClassified();
  const rejectClassified = useRejectClassified();

  const filteredClassifieds = classifieds?.filter(c => 
    !search || 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    await approveClassified.mutateAsync(id);
  };

  const handleReject = async () => {
    if (!selectedClassified) return;
    await rejectClassified.mutateAsync({ id: selectedClassified.id, reason: rejectReason });
    setShowRejectDialog(false);
    setSelectedClassified(null);
    setRejectReason("");
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Classificados</h1>
        <p className="text-muted-foreground">Gerencie os anúncios de classificados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">
              {classifieds?.filter(c => c.status === 'pending').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {classifieds?.filter(c => c.status === 'approved').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Aprovados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {classifieds?.filter(c => c.status === 'rejected').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Rejeitados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {classifieds?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar anúncios..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredClassifieds && filteredClassifieds.length > 0 ? (
        <div className="space-y-4">
          {filteredClassifieds.map((classified) => {
            const categoryLabel = CLASSIFIED_CATEGORIES.find(c => c.value === classified.category)?.label;
            const statusInfo = STATUS_MAP[classified.status] || STATUS_MAP.pending;

            return (
              <Card key={classified.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="shrink-0">
                      {classified.images?.[0] ? (
                        <img
                          src={classified.images[0]}
                          alt=""
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium line-clamp-1">{classified.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {categoryLabel} • {classified.contact_name}
                          </p>
                        </div>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatPrice(classified.price)}
                        </span>
                        {classified.neighborhood && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {classified.neighborhood}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(classified.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {classified.views_count}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {classified.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(classified.id)}
                          disabled={approveClassified.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedClassified(classified);
                            setShowRejectDialog(true);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhum anúncio encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Anúncio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Informe o motivo da rejeição do anúncio "{selectedClassified?.title}":
            </p>
            <Textarea
              placeholder="Motivo da rejeição..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason || rejectClassified.isPending}
            >
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
