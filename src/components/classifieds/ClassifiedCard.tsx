import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Heart, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Classified, CLASSIFIED_CATEGORIES } from "@/hooks/useClassifieds";

interface ClassifiedCardProps {
  classified: Classified;
}

export function ClassifiedCard({ classified }: ClassifiedCardProps) {
  const categoryLabel = CLASSIFIED_CATEGORIES.find(c => c.value === classified.category)?.label || classified.category;
  
  const formatPrice = (price: number | null) => {
    if (!price) return 'Preço a combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Link to={`/classificados/${classified.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-[4/3] bg-muted">
          {classified.images?.[0] ? (
            <img
              src={classified.images[0]}
              alt={classified.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sem imagem
            </div>
          )}
          <Badge className="absolute top-2 left-2" variant="secondary">
            {categoryLabel}
          </Badge>
        </div>
        
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {classified.title}
          </h3>
          
          <p className="text-lg font-bold text-primary">
            {formatPrice(classified.price)}
            {classified.is_negotiable && (
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (Negociável)
              </span>
            )}
          </p>
          
          {classified.neighborhood && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {classified.neighborhood}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(classified.created_at), { 
                addSuffix: true,
                locale: ptBR 
              })}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {classified.views_count}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {classified.favorites_count}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
