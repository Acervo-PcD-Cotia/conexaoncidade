import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { List } from 'lucide-react';
import { AD_SLOTS } from '@/lib/adSlots';

const BLOCK_NAMES: Record<string, string> = {
  ads: 'Ads',
  publidoor: 'Publidoor',
  webstories: 'WebStories',
  login: 'Login',
  experience: 'Experiência',
};

export function FormatReferenceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <List className="h-4 w-4" />
          Ver 15 Formatos Oficiais
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>15 Formatos Comerciais Oficiais</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto rounded-lg border mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th className="border-b px-3 py-2.5 text-left text-xs font-semibold w-8">#</th>
                <th className="border-b px-3 py-2.5 text-left text-xs font-semibold">Bloco</th>
                <th className="border-b px-3 py-2.5 text-left text-xs font-semibold">Nome Comercial</th>
                <th className="border-b px-3 py-2.5 text-left text-xs font-semibold">Dimensão</th>
                <th className="border-b px-3 py-2.5 text-left text-xs font-semibold">Onde Aparece</th>
              </tr>
            </thead>
            <tbody>
              {AD_SLOTS.map((slot) => (
                <tr key={slot.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{slot.seq}</td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {BLOCK_NAMES[slot.channel] || slot.channel}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-medium text-foreground">{slot.label}</td>
                  <td className="px-3 py-2 font-mono text-xs">{slot.width}×{slot.height}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{slot.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
