import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, School, MapPin, Loader2 } from "lucide-react";
import { TransporterCard } from "@/components/transporte-escolar/TransporterCard";
import { TransportDisclaimer } from "@/components/transporte-escolar/TransportDisclaimer";
import { useSchoolBySlug, useSchools } from "@/hooks/useSchools";
import { useTransportersBySchool } from "@/hooks/useTransporters";

export default function TransporteEscolarEscola() {
  const { slug } = useParams<{ slug: string }>();
  const { data: school, isLoading: schoolLoading } = useSchoolBySlug(slug || "");
  const { data: transporters, isLoading: transportersLoading } = useTransportersBySchool(school?.id || "");

  const isLoading = schoolLoading || transportersLoading;

  const redeLabels: Record<string, string> = {
    municipal: "Municipal",
    estadual: "Estadual",
    particular: "Particular",
  };

  if (schoolLoading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Escola não encontrada</h1>
        <Link to="/transporte-escolar">
          <Button>Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Transporte Escolar para {school.nome_oficial} | Cotia</title>
        <meta
          name="description"
          content={`Encontre transporte escolar para ${school.nome_oficial} em ${school.bairro}, Cotia. Veja opções de vans e transportadores verificados.`}
        />
        <meta name="keywords" content={`transporte escolar ${school.nome_oficial}, van escolar ${school.bairro} cotia`} />
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
          {/* School Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <School className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{school.nome_oficial}</h1>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {school.bairro}
                    </span>
                    <span className="px-2 py-0.5 bg-secondary rounded">
                      {redeLabels[school.rede] || school.rede}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transporters */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold">
              Transportadores que atendem esta escola
            </h2>

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
                    Ainda não há transportadores cadastrados para esta escola.
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
