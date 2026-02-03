import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bed, Bath, Car, Square, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Imovel } from "../types";
import { TIPO_LABELS, FINALIDADE_LABELS } from "../types";

interface ImovelCardProps {
  imovel: Imovel;
  showFavorite?: boolean;
}

export function ImovelCard({ imovel, showFavorite = true }: ImovelCardProps) {
  const capaUrl = imovel.imagens?.find((img) => img.is_capa)?.url || 
                  imovel.imagens?.[0]?.url || 
                  "/placeholder.svg";

  const formatPrice = (value?: number) => {
    if (!value) return "Consulte";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link to={`/imoveis/${imovel.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={capaUrl}
            alt={imovel.titulo}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {FINALIDADE_LABELS[imovel.finalidade]}
            </Badge>
            {imovel.destaque && (
              <Badge className="bg-amber-500 text-white">Destaque</Badge>
            )}
            {imovel.lancamento && (
              <Badge className="bg-green-500 text-white">Lançamento</Badge>
            )}
          </div>

          {/* Favorite button */}
          {showFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Toggle favorite
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-xl font-bold text-white">
              {formatPrice(imovel.preco)}
              {imovel.finalidade === "aluguel" && (
                <span className="text-sm font-normal">/mês</span>
              )}
            </p>
            {imovel.condominio_valor && imovel.condominio_valor > 0 && (
              <p className="text-xs text-white/80">
                + {formatPrice(imovel.condominio_valor)} condomínio
              </p>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {TIPO_LABELS[imovel.tipo]}
            </Badge>
          </div>

          <h3 className="mb-2 line-clamp-2 font-semibold leading-tight group-hover:text-primary">
            {imovel.titulo}
          </h3>

          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">
              {imovel.bairro}, {imovel.cidade}
            </span>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {imovel.quartos > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {imovel.quartos}
              </span>
            )}
            {imovel.banheiros > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {imovel.banheiros}
              </span>
            )}
            {imovel.vagas > 0 && (
              <span className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                {imovel.vagas}
              </span>
            )}
            {imovel.area_construida && (
              <span className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                {imovel.area_construida}m²
              </span>
            )}
          </div>

          {/* Published date */}
          {imovel.published_at && (
            <p className="mt-3 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(imovel.published_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
