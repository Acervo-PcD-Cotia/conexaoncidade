import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, ArrowRight, Gift } from 'lucide-react';

export function PhoneBenefitCard() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">Escolha do Celular Ideal</h3>
              <Gift className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Uma ajuda prática para escolher seu próximo celular.
            </p>
            <Button asChild size="sm" variant="outline" className="w-full h-8 text-xs">
              <Link to="/comunidade/beneficios/celular-ideal">
                Acessar Benefício
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
