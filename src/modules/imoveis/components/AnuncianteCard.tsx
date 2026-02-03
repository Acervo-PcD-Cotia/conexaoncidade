import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Phone, MapPin, Star, Home } from "lucide-react";
import type { Anunciante } from "../types";
import { PLANO_LABELS } from "../types";

interface AnuncianteCardProps {
  anunciante: Anunciante;
}

export function AnuncianteCard({ anunciante }: AnuncianteCardProps) {
  const initials = anunciante.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <Link to={`/imoveis/corretor/${anunciante.slug}`}>
        {/* Cover */}
        {anunciante.capa_url && (
          <div className="h-24 w-full overflow-hidden">
            <img
              src={anunciante.capa_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <CardContent className={`p-4 ${anunciante.capa_url ? "-mt-8" : ""}`}>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-4 border-background">
              <AvatarImage src={anunciante.logo_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{anunciante.nome}</h3>
                {anunciante.is_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Verificado
                  </Badge>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {anunciante.tipo === "corretor" ? "Corretor" : "Imobiliária"}
                </Badge>
                {anunciante.creci && (
                  <span className="text-xs">CRECI {anunciante.creci}</span>
                )}
              </div>

              {anunciante.cidade_base && (
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {anunciante.cidade_base}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{anunciante.total_imoveis}</span>
              <span className="text-muted-foreground">imóveis</span>
            </div>

            {anunciante.rating_count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{anunciante.rating_avg.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({anunciante.rating_count})
                </span>
              </div>
            )}
          </div>

          {/* Plan badge */}
          {anunciante.plano !== "free" && (
            <Badge
              className={`mt-3 ${
                anunciante.plano === "partner"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              } text-white`}
            >
              {PLANO_LABELS[anunciante.plano]}
            </Badge>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
