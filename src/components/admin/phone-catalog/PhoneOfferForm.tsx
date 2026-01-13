import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import type { OfferFormData } from '@/hooks/usePhoneImport';

interface PhoneOfferFormProps {
  offers: OfferFormData[];
  onChange: (offers: OfferFormData[]) => void;
  detectedPrice?: number | null;
}

const STORES = [
  'Amazon',
  'Magazine Luiza',
  'Mercado Livre',
  'Americanas',
  'Shopee',
  'Casas Bahia',
  'Ponto',
  'Carrefour',
  'Fast Shop',
  'Kabum',
  'Outros',
];

const EMPTY_OFFER: OfferFormData = {
  store_name: '',
  affiliate_url: '',
  price: null,
  original_price: null,
  priority: 1,
  is_active: true,
};

export function PhoneOfferForm({ offers, onChange, detectedPrice }: PhoneOfferFormProps) {
  const addOffer = () => {
    const newOffer: OfferFormData = {
      ...EMPTY_OFFER,
      price: detectedPrice || null,
      priority: offers.length + 1,
    };
    onChange([...offers, newOffer]);
  };

  const updateOffer = (index: number, field: keyof OfferFormData, value: any) => {
    const updated = [...offers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeOffer = (index: number) => {
    onChange(offers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Ofertas de Afiliados</h3>
        <Button type="button" variant="outline" size="sm" onClick={addOffer}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Oferta
        </Button>
      </div>

      {offers.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma oferta adicionada. Clique em "Adicionar Oferta" para começar.
        </p>
      )}

      {offers.map((offer, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Oferta #{index + 1}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOffer(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Loja *</Label>
                <Select 
                  value={offer.store_name} 
                  onValueChange={(v) => updateOffer(index, 'store_name', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORES.map(store => (
                      <SelectItem key={store} value={store}>{store}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select 
                  value={String(offer.priority)} 
                  onValueChange={(v) => updateOffer(index, 'priority', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(p => (
                      <SelectItem key={p} value={String(p)}>
                        {p} {p === 1 && '(Melhor)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link de Afiliado *</Label>
              <div className="flex gap-2">
                <Input
                  value={offer.affiliate_url}
                  onChange={(e) => updateOffer(index, 'affiliate_url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                {offer.affiliate_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(offer.affiliate_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Preço Atual (R$)</Label>
                <Input
                  type="number"
                  value={offer.price || ''}
                  onChange={(e) => updateOffer(index, 'price', e.target.value ? Number(e.target.value) : null)}
                  placeholder="1999.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Preço Original (R$)</Label>
                <Input
                  type="number"
                  value={offer.original_price || ''}
                  onChange={(e) => updateOffer(index, 'original_price', e.target.value ? Number(e.target.value) : null)}
                  placeholder="2499.00"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={offer.is_active}
                onCheckedChange={(v) => updateOffer(index, 'is_active', v)}
              />
              <Label>Oferta ativa</Label>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
