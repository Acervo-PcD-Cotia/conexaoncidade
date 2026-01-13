import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bus, Search, UserPlus, School, MapPin, Shield, Accessibility } from "lucide-react";
import { SchoolAutocomplete, type School as SchoolType } from "@/components/transporte-escolar/SchoolAutocomplete";
import { TransporterCard } from "@/components/transporte-escolar/TransporterCard";
import { TransporterFilters, TransporterFiltersState } from "@/components/transporte-escolar/TransporterFilters";
import { TransportDisclaimer } from "@/components/transporte-escolar/TransportDisclaimer";
import { TransportFAQ } from "@/components/transporte-escolar/TransportFAQ";
import { useTransporters } from "@/hooks/useTransporters";
import { useTransportStats } from "@/hooks/useTransportSearch";

export default function TransporteEscolarHome() {
  const [selectedSchool, setSelectedSchool] = useState<{ id: string; nome_oficial: string; slug?: string } | null>(null);
  const [filters, setFilters] = useState<TransporterFiltersState>({});

  const { data: stats } = useTransportStats();
  const { data: transporters, isLoading } = useTransporters({
    status: "ativo",
    schoolId: selectedSchool?.id,
    ...filters,
  });

  const featuredTransporters = transporters?.slice(0, 6) || [];

  return (
    <>
      <Helmet>
        <title>Transporte Escolar em Cotia | Conexão na Cidade</title>
        <meta
          name="description"
          content="Encontre transportadores escolares confiáveis em Cotia. Compare preços, verifique referências e contrate o melhor transporte para seu filho."
        />
        <meta name="keywords" content="transporte escolar cotia, van escolar cotia, transporte escolar granja viana" />
      </Helmet>

      <div className="container py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Bus className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Transporte Escolar em Cotia
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre transportadores escolares verificados para seu filho. 
            Compare opções, veja referências e contrate com segurança.
          </p>

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.schools}</p>
                <p className="text-sm text-muted-foreground">Escolas cadastradas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.transportersActive}</p>
                <p className="text-sm text-muted-foreground">Transportadores ativos</p>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/transporte-escolar/encontrar">
              <Button size="lg" className="gap-2">
                <Search className="h-5 w-5" />
                Encontrar Transporte
              </Button>
            </Link>
            <Link to="/transporte-escolar/cadastrar">
              <Button size="lg" variant="outline" className="gap-2">
                <UserPlus className="h-5 w-5" />
                Cadastrar Transporte
              </Button>
            </Link>
          </div>
        </section>

        {/* Quick Search */}
        <section className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-center">Busca Rápida por Escola</h2>
              <SchoolAutocomplete
                value={selectedSchool?.id}
                onSelect={(id, data) => setSelectedSchool(data ? { id, nome_oficial: data.nome_oficial } : null)}
                placeholder="Digite o nome da escola..."
              />
              {selectedSchool && (
                <div className="text-center">
                  <Link to={`/transporte-escolar/escola/${selectedSchool.slug}`}>
                    <Button variant="link">
                      Ver todos os transportadores de {selectedSchool.nome_oficial}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Features */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Verificados</h3>
              <p className="text-sm text-muted-foreground">
                Transportadores passam por verificação de documentos e referências
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <School className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">Por Escola</h3>
              <p className="text-sm text-muted-foreground">
                Filtre por escola para encontrar quem já atende sua região
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Accessibility className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Acessível</h3>
              <p className="text-sm text-muted-foreground">
                Opções de transporte adaptado para pessoas com deficiência
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Filters */}
        <section className="space-y-6">
          <TransporterFilters
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({})}
          />
        </section>

        {/* Featured Transporters */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Transportadores em Destaque</h2>
            <Link to="/transporte-escolar/encontrar">
              <Button variant="ghost">Ver todos</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted" />
              ))}
            </div>
          ) : featuredTransporters.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredTransporters.map((transporter) => (
                <TransporterCard key={transporter.id} transporter={transporter} />
              ))}
            </div>
          ) : Object.keys(filters).length > 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum transportador encontrado com os filtros selecionados.
                </p>
                <Button
                  variant="link"
                  onClick={() => setFilters({})}
                  className="mt-2"
                >
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-muted rounded-full">
                  <Bus className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Em breve!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Estamos cadastrando transportadores da região de Cotia. 
                    É transportador escolar? Cadastre-se agora e seja um dos primeiros!
                  </p>
                </div>
                <Link to="/transporte-escolar/cadastrar">
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Quero me cadastrar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Disclaimer */}
        <TransportDisclaimer />

        {/* FAQ */}
        <TransportFAQ />

        {/* CTA Final */}
        <section className="text-center py-12 space-y-6 bg-muted/50 rounded-2xl">
          <h2 className="text-2xl font-bold">É transportador escolar?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Cadastre-se gratuitamente e apareça para pais que buscam transporte escolar em Cotia.
          </p>
          <Link to="/transporte-escolar/cadastrar">
            <Button size="lg">
              <UserPlus className="h-5 w-5 mr-2" />
              Cadastrar meu serviço
            </Button>
          </Link>
        </section>
      </div>
    </>
  );
}
