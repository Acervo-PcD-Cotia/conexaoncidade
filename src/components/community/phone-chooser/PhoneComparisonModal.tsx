import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X } from 'lucide-react';
import type { Phone } from '@/hooks/usePhoneChooser';

interface PhoneComparisonModalProps {
  phones: Phone[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhoneComparisonModal({ phones, open, onOpenChange }: PhoneComparisonModalProps) {
  const formatPrice = (min: number, max: number) => {
    const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    if (min === max) {
      return formatter.format(min);
    }
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const renderScore = (score: number) => {
    return (
      <div className="flex gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= score ? 'fill-primary text-primary' : 'fill-muted text-muted'}`}
          />
        ))}
      </div>
    );
  };

  const hasUseCase = (phone: Phone, useCase: string) => {
    return phone.use_cases.includes(useCase);
  };

  const useCases = ['social', 'photography', 'games', 'work', 'streaming'];
  const useCaseLabels: Record<string, string> = {
    social: 'Redes Sociais',
    photography: 'Fotografia',
    games: 'Jogos',
    work: 'Trabalho',
    streaming: 'Vídeos',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparativo de Celulares</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Característica</th>
                {phones.map((phone) => (
                  <th key={phone.id} className="text-center py-3 px-2">
                    <div className="font-semibold">{phone.name}</div>
                    <Badge variant="outline" className="mt-1">
                      {phone.brand}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Preço</td>
                {phones.map((phone) => (
                  <td key={phone.id} className="text-center py-3 px-2 font-semibold text-primary">
                    {formatPrice(phone.price_min, phone.price_max)}
                  </td>
                ))}
              </tr>

              {/* Camera */}
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Câmera</td>
                {phones.map((phone) => (
                  <td key={phone.id} className="text-center py-3 px-2">
                    {renderScore(phone.camera_score)}
                  </td>
                ))}
              </tr>

              {/* Battery */}
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Bateria</td>
                {phones.map((phone) => (
                  <td key={phone.id} className="text-center py-3 px-2">
                    {renderScore(phone.battery_score)}
                  </td>
                ))}
              </tr>

              {/* Gaming */}
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Jogos</td>
                {phones.map((phone) => (
                  <td key={phone.id} className="text-center py-3 px-2">
                    {renderScore(phone.gaming_score)}
                  </td>
                ))}
              </tr>

              {/* Use cases */}
              {useCases.map((useCase) => (
                <tr key={useCase} className="border-b">
                  <td className="py-3 px-2 font-medium">{useCaseLabels[useCase]}</td>
                  {phones.map((phone) => (
                    <td key={phone.id} className="text-center py-3 px-2">
                      {hasUseCase(phone, useCase) ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Ideal for */}
              <tr>
                <td className="py-3 px-2 font-medium">Ideal para</td>
                {phones.map((phone) => (
                  <td key={phone.id} className="text-center py-3 px-2 text-sm text-muted-foreground">
                    {phone.ideal_for}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
