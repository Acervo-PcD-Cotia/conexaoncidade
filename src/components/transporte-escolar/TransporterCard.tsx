import { Phone, MessageCircle, MapPin, Users, Clock, ShieldCheck, Car, Accessibility, Snowflake, Shield, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransporterWithRelations } from "@/hooks/useTransporters";

interface TransporterCardProps {
  transporter: TransporterWithRelations;
  onReport?: () => void;
  showSchools?: boolean;
}

export function TransporterCard({ transporter, onReport, showSchools = true }: TransporterCardProps) {
  const veiculoLabels: Record<string, string> = {
    van: "Van",
    kombi: "Kombi",
    micro_onibus: "Micro-ônibus",
    onibus: "Ônibus",
    carro: "Carro",
  };

  const servicoLabels: Record<string, string> = {
    porta_a_porta: "Porta a porta",
    ponto_encontro: "Ponto de encontro",
    ambos: "Porta a porta e ponto",
  };

  const vagasLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    tenho_vagas: { label: "Com vagas", variant: "default" },
    sem_vagas: { label: "Sem vagas", variant: "destructive" },
    lista_espera: { label: "Lista de espera", variant: "secondary" },
  };

  const turnoLabels: Record<string, string> = {
    manha: "Manhã",
    tarde: "Tarde",
    noite: "Noite",
    integral: "Integral",
  };

  const acessibilidadeLabels: Record<string, string> = {
    cadeira_rodas: "Cadeira de rodas",
    mobilidade_reduzida: "Mobilidade reduzida",
    tea_sensibilidades: "TEA/Sensibilidades",
  };

  const verificacaoLabels: Record<number, { label: string; color: string }> = {
    0: { label: "Não verificado", color: "bg-muted" },
    1: { label: "Verificado", color: "bg-blue-500" },
    2: { label: "Recomendado", color: "bg-green-500" },
    3: { label: "Premium", color: "bg-amber-500" },
  };

  const whatsappLink = `https://wa.me/55${transporter.whatsapp.replace(/\D/g, '')}`;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{transporter.nome}</h3>
              {transporter.nivel_verificacao > 0 && (
                <Badge 
                  variant="secondary"
                  className={`${verificacaoLabels[transporter.nivel_verificacao].color} text-white`}
                >
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {verificacaoLabels[transporter.nivel_verificacao].label}
                </Badge>
              )}
            </div>
            {transporter.descricao_curta && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {transporter.descricao_curta}
              </p>
            )}
          </div>
          <Badge variant={vagasLabels[transporter.vagas_status].variant}>
            {vagasLabels[transporter.vagas_status].label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Características */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1">
            <Car className="h-3 w-3" />
            {veiculoLabels[transporter.veiculo_tipo]}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3 w-3" />
            {servicoLabels[transporter.tipo_servico] || transporter.tipo_servico}
          </Badge>
          {transporter.capacidade_aprox && (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              ~{transporter.capacidade_aprox} lugares
            </Badge>
          )}
          {transporter.ar_condicionado && (
            <Badge variant="outline" className="gap-1">
              <Snowflake className="h-3 w-3" />
              Ar-cond.
            </Badge>
          )}
          {transporter.cinto_individual && (
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              Cinto individual
            </Badge>
          )}
        </div>

        {/* Acessibilidade */}
        {transporter.atende_acessibilidade && transporter.acessibilidade_tipos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 gap-1">
              <Accessibility className="h-3 w-3" />
              Acessível
            </Badge>
            {transporter.acessibilidade_tipos.map(tipo => (
              <Badge key={tipo} variant="outline" className="text-xs">
                {acessibilidadeLabels[tipo] || tipo}
              </Badge>
            ))}
          </div>
        )}

        {/* Áreas de cobertura */}
        {transporter.transporter_areas && transporter.transporter_areas.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Áreas atendidas:</p>
            <div className="flex flex-wrap gap-1">
              {transporter.transporter_areas.slice(0, 6).map((area) => (
                <Badge key={area.id} variant="outline" className="text-xs">
                  {area.bairro} ({turnoLabels[area.turno]})
                </Badge>
              ))}
              {transporter.transporter_areas.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{transporter.transporter_areas.length - 6} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Escolas atendidas */}
        {showSchools && transporter.transporter_schools && transporter.transporter_schools.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Escolas atendidas:</p>
            <div className="flex flex-wrap gap-1">
              {transporter.transporter_schools.slice(0, 4).map((ts) => (
                <Badge key={ts.school_id} variant="outline" className="text-xs">
                  {ts.schools?.nome_oficial}
                </Badge>
              ))}
              {transporter.transporter_schools.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{transporter.transporter_schools.length - 4} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1 gap-2">
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={`Entrar em contato com ${transporter.nome} via WhatsApp`}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          {transporter.telefone && (
            <Button variant="outline" asChild className="gap-2">
              <a 
                href={`tel:${transporter.telefone}`}
                aria-label={`Ligar para ${transporter.nome}`}
              >
                <Phone className="h-4 w-4" />
                Ligar
              </a>
            </Button>
          )}
        </div>

        {/* Denunciar */}
        {onReport && (
          <div className="pt-2 border-t">
            <button
              onClick={onReport}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Denunciar problema com este transportador"
            >
              Denunciar problema
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
