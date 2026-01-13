import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, School, Loader2 } from "lucide-react";
import { TransportDisclaimer } from "@/components/transporte-escolar/TransportDisclaimer";
import { useSchools } from "@/hooks/useSchools";
import { useTransporters } from "@/hooks/useTransporters";

const redeLabels: Record<string, string> = {
  municipal: "Municipal",
  estadual: "Estadual",
  particular: "Particular",
};

const redeDescriptions: Record<string, string> = {
  municipal: "Escolas municipais de Cotia",
  estadual: "Escolas estaduais de São Paulo em Cotia",
  particular: "Escolas particulares de Cotia",
};

export default function TransporteEscolarRede() {
  const { rede } = useParams<{ rede: string }>();
  const { data: schools, isLoading: schoolsLoading } = useSchools({ rede: rede as any });
  const { data: transporters } = useTransporters({ status: "ativo" });

  const redeLabel = rede ? redeLabels[rede] || rede : "";
  const redeDescription = rede ? redeDescriptions[rede] || "" : "";

  // Filter transporters that serve schools in this network
  const transporterCount = transporters?.filter(t => 
    t.transporter_schools?.some(ts => 
      schools?.some(s => s.id === ts.school_id)
    )
  ).length || 0;

  if (!rede || !redeLabels[rede]) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Rede não encontrada</h1>
        <Link to="/transporte-escolar">
          <Button>Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Transporte Escolar Rede {redeLabel} | Cotia</title>
        <meta
          name="description"
          content={`Encontre transporte escolar para escolas da rede ${redeLabel.toLowerCase()} em Cotia. Veja transportadores verificados.`}
        />
      </Helmet>

      <div className="container py-8">
        <div className="mb-8">
          <Link to="/transporte-escolar">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">
              Transporte Escolar - Rede {redeLabel}
            </h1>
            <p className="text-muted-foreground">{redeDescription}</p>
            {!schoolsLoading && (
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{schools?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">escolas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{transporterCount}</p>
                  <p className="text-sm text-muted-foreground">transportadores</p>
                </div>
              </div>
            )}
          </div>

          {/* Schools List */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Escolas da rede {redeLabel}</h2>

            {schoolsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : schools && schools.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {schools.map((school) => (
                  <Link key={school.id} to={`/transporte-escolar/escola/${school.slug}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <School className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <h3 className="font-medium line-clamp-2">{school.nome_oficial}</h3>
                            <p className="text-sm text-muted-foreground">{school.bairro}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhuma escola da rede {redeLabel} cadastrada ainda.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          <div className="text-center py-8">
            <Link to="/transporte-escolar/encontrar">
              <Button size="lg">Encontrar transporte</Button>
            </Link>
          </div>

          <TransportDisclaimer />
        </div>
      </div>
    </>
  );
}
