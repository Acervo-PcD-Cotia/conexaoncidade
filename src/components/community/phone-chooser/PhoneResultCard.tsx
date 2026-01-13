import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Check, AlertCircle, Star, Accessibility } from 'lucide-react';
import type { Phone } from '@/hooks/usePhoneChooser';
import { PhoneOfferButtons } from './PhoneOfferButtons';
import { AccessibilityScore } from './AccessibilityScore';
import { AccessibilityBadgeList } from './AccessibilityBadge';

interface PhoneResultCardProps {
  phone: Phone;
  isMain?: boolean;
  reasonText?: string;
}

export function PhoneResultCard({ phone, isMain = false, reasonText }: PhoneResultCardProps) {
  const formatPrice = (min: number, max: number) => {
    const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    if (min === max) {
      return formatter.format(min);
    }
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const getRangeLabel = (range: string) => {
    switch (range) {
      case 'budget':
        return 'Econômico';
      case 'mid':
        return 'Intermediário';
      case 'premium':
        return 'Premium';
      case 'flagship':
        return 'Topo de Linha';
      default:
        return range;
    }
  };

  const renderScore = (score: number, label: string) => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <div className="flex gap-0.5" aria-label={`${label}: ${score} de 5 estrelas`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i <= score ? 'fill-primary text-primary' : 'fill-muted text-muted'}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  };

  const hasAccessibility = (phone.accessibility_score || 0) > 0 || 
                           (phone.accessibility_badges?.length || 0) > 0;

  return (
    <Card className={isMain ? 'border-primary ring-2 ring-primary/20' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Smartphone className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">{phone.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary">{phone.brand}</Badge>
                <Badge variant="outline">{getRangeLabel(phone.price_range)}</Badge>
              </div>
            </div>
          </div>
          {isMain && (
            <Badge className="bg-primary text-primary-foreground shrink-0">
              Mais Indicado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="text-2xl font-bold text-primary">
          {formatPrice(phone.price_min, phone.price_max)}
        </div>

        {/* Accessibility Section */}
        {hasAccessibility && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Acessibilidade</span>
              </div>
              {(phone.accessibility_score || 0) > 0 && (
                <AccessibilityScore score={phone.accessibility_score || 0} size="sm" />
              )}
            </div>
            {phone.accessibility_badges && phone.accessibility_badges.length > 0 && (
              <AccessibilityBadgeList badges={phone.accessibility_badges} size="sm" />
            )}
          </div>
        )}

        {/* Ideal for */}
        <div className="text-sm">
          <span className="text-muted-foreground">Ideal para: </span>
          <span className="font-medium">{phone.ideal_for}</span>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-y">
          {renderScore(phone.camera_score, 'Câmera')}
          {renderScore(phone.battery_score, 'Bateria')}
          {renderScore(phone.gaming_score, 'Jogos')}
        </div>

        {/* Reason text */}
        {reasonText && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium text-primary">{reasonText}</p>
          </div>
        )}

        {/* Strengths */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
            Pontos Fortes
          </h4>
          <ul className="space-y-1" role="list">
            {phone.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-green-600 mt-0.5" aria-hidden="true">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Considerations */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
            Pontos de Atenção
          </h4>
          <ul className="space-y-1" role="list">
            {phone.considerations.map((consideration, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-600 mt-0.5" aria-hidden="true">•</span>
                {consideration}
              </li>
            ))}
          </ul>
        </div>

        {/* Affiliate Offer Buttons */}
        <PhoneOfferButtons phoneId={phone.id} />
      </CardContent>
    </Card>
  );
}
