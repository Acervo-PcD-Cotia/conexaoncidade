import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, ExternalLink, GripVertical } from 'lucide-react';
import { usePhoneOffers, type PhoneOffer } from '@/hooks/usePhoneOffers';

interface PhoneOffersManagerProps {
  phoneId: string;
  phoneName: string;
}

type OfferFormData = {
  store: string;
  affiliate_url: string;
  price: number | null;
  priority: number;
  button_text: string;
  is_active: boolean;
};

const INITIAL_FORM: OfferFormData = {
  store: 'Amazon',
  affiliate_url: '',
  price: null,
  priority: 1,
  button_text: '',
  is_active: true,
};

const COMMON_STORES = ['Amazon', 'Mercado Livre', 'Magazine Luiza', 'Americanas', 'Casas Bahia', 'Shopee', 'AliExpress', 'Kabum', 'Ponto Frio', 'Outro'];

export function PhoneOffersManager({ phoneId, phoneName }: PhoneOffersManagerProps) {
  const { offers, isLoadingOffers, createOffer, updateOffer, deleteOffer, toggleOfferActive } = usePhoneOffers(phoneId);

  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<PhoneOffer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>(INITIAL_FORM);

  const openNewForm = () => {
    setEditingOffer(null);
    setFormData({
      ...INITIAL_FORM,
      priority: offers.length + 1,
    });
    setShowForm(true);
  };

  const openEditForm = (offer: PhoneOffer) => {
    setEditingOffer(offer);
    setFormData({
      store: offer.store,
      affiliate_url: offer.affiliate_url,
      price: offer.price,
      priority: offer.priority,
      button_text: offer.button_text || '',
      is_active: offer.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (editingOffer) {
      await updateOffer.mutateAsync({
        id: editingOffer.id,
        ...formData,
        button_text: formData.button_text || null,
      });
    } else {
      await createOffer.mutateAsync({
        phone_id: phoneId,
        ...formData,
        button_text: formData.button_text || null,
      });
    }
    setShowForm(false);
  };

  const handleDelete = async (offer: PhoneOffer) => {
    if (confirm(`Remover oferta da ${offer.store}?`)) {
      await deleteOffer.mutateAsync({ id: offer.id, phoneId });
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ofertas e Afiliados</CardTitle>
          <Button size="sm" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Oferta
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Gerencie os links de afiliado para {phoneName}
        </p>
      </CardHeader>
      <CardContent>
        {isLoadingOffers ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma oferta cadastrada</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={openNewForm}>
              Adicionar primeira oferta
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GripVertical className="w-4 h-4" />
                        {offer.priority}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{offer.store}</Badge>
                    </TableCell>
                    <TableCell>{formatPrice(offer.price)}</TableCell>
                    <TableCell>
                      <a
                        href={offer.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-sm max-w-[200px] truncate"
                      >
                        {offer.affiliate_url.replace(/^https?:\/\//, '').slice(0, 30)}...
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={offer.is_active}
                        onCheckedChange={(checked) =>
                          toggleOfferActive.mutate({ id: offer.id, is_active: checked, phoneId })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(offer)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(offer)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'Editar Oferta' : 'Nova Oferta'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="store">Loja</Label>
              <Select
                value={formData.store}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, store: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_STORES.map((store) => (
                    <SelectItem key={store} value={store}>
                      {store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliate_url">Link de Afiliado</Label>
              <Input
                id="affiliate_url"
                value={formData.affiliate_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, affiliate_url: e.target.value }))}
                placeholder="https://amzn.to/xxx"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value ? Number(e.target.value) : null }))
                  }
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Input
                  id="priority"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">1 = principal</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="button_text">Texto do Botão (opcional)</Label>
              <Input
                id="button_text"
                value={formData.button_text}
                onChange={(e) => setFormData((prev) => ({ ...prev, button_text: e.target.value }))}
                placeholder="Comprar com desconto"
              />
              <p className="text-xs text-muted-foreground">
                Se vazio, usa texto padrão: "Melhor oferta" ou "Comprar na {'{loja}'}"
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Oferta Ativa</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.affiliate_url || createOffer.isPending || updateOffer.isPending}
            >
              {editingOffer ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
