import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, School, Loader2 } from "lucide-react";
import { TransporterCard } from "@/components/transporte-escolar/TransporterCard";
import { TransportDisclaimer } from "@/components/transporte-escolar/TransportDisclaimer";
import { useSchools } from "@/hooks/useSchools";
import { useTransporters } from "@/hooks/useTransporters";

export default function TransporteEscolarBairro() {
  const { bairro } = useParams<{ bairro: string }>();
  const decodedBairro = bairro ? decodeURIComponent(bairro) : "";
  
  const { data: schools, isLoading: schoolsLoading } = useSchools({ bairro: decodedBairro });
  const { data: transporters, isLoading: transportersLoading } = useTransporters({
    status: "ativo",
    bairro: decodedBairro,
  });

  const isLoading = schoolsLoading || transportersLoading;

  if (!bairro) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Bairro não encontrado</h1>
        <Link to="/transporte-escolar">
          <Button>Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Transporte Escolar em {decodedBairro} | Cotia</title>
        <meta
          name="description"
          content={`Encontre transporte escolar em ${decodedBairro}, Cotia. Veja escolas e transportadores disponíveis na região.`}
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
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">
              Transporte Escolar em {decodedBairro}
            </h1>
            <p className="text-muted-foreground">
              Escolas e transportadores disponíveis nesta região
            </p>
            {!isLoading && (
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{schools?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">escolas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{transporters?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">transportadores</p>
                </div>
              </div>
            )}
          </div>

          {/* Schools in this neighborhood */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Escolas em {decodedBairro}</h2>

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
                            <p className="text-sm text-muted-foreground capitalize">
                              {school.rede}
                            </p>
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
                    Nenhuma escola cadastrada neste bairro ainda.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Transporters covering this neighborhood */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Transportadores em {decodedBairro}</h2>

            {transportersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : transporters && transporters.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {transporters.map((transporter) => (
                  <TransporterCard key={transporter.id} transporter={transporter} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Nenhum transportador cadastrado para este bairro ainda.
                  </p>
                  <Link to="/transporte-escolar/encontrar">
                    <Button>Fazer busca personalizada</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>

          <TransportDisclaimer />
        </div>
      </div>
    </>
  );
}
