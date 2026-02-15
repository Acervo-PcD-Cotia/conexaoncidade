import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bus, School, Users, MessageSquare, AlertTriangle, ChevronRight, Loader2, Upload } from "lucide-react";
import { useSchools } from "@/hooks/useSchools";
import { useTransporters } from "@/hooks/useTransporters";
import { useTransportLeads, useTransportReports } from "@/hooks/useTransportLeads";

export default function TransporteEscolarAdmin() {
  const { data: schools, isLoading: schoolsLoading } = useSchools();
  const { data: transporters, isLoading: transportersLoading } = useTransporters();
  const { data: leads, isLoading: leadsLoading } = useTransportLeads();
  const { data: reports, isLoading: reportsLoading } = useTransportReports();

  const isLoading = schoolsLoading || transportersLoading || leadsLoading || reportsLoading;

  const activeSchools = schools?.filter(s => s.status === 'ativo').length || 0;
  const activeTransporters = transporters?.filter(t => t.status === 'ativo').length || 0;
  const pendingTransporters = transporters?.filter(t => t.status === 'pendente').length || 0;
  const newLeads = leads?.filter(l => l.status === 'novo').length || 0;
  const pendingReports = reports?.filter(r => r.status === 'novo').length || 0;

  const menuItems = [
    {
      title: "Escolas",
      description: "Gerenciar catálogo de escolas",
      href: "/spah/painel/transporte-escolar/escolas",
      icon: School,
      stats: `${activeSchools} ativas`,
    },
    {
      title: "Transportadores",
      description: "Aprovar e gerenciar transportadores",
      href: "/spah/painel/transporte-escolar/transportadores",
      icon: Users,
      stats: pendingTransporters > 0 ? `${pendingTransporters} pendentes` : `${activeTransporters} ativos`,
      alert: pendingTransporters > 0,
    },
    {
      title: "Leads",
      description: "Solicitações de pais",
      href: "/spah/painel/transporte-escolar/leads",
      icon: MessageSquare,
      stats: newLeads > 0 ? `${newLeads} novos` : "Nenhum novo",
      alert: newLeads > 0,
    },
    {
      title: "Denúncias",
      description: "Gerenciar denúncias",
      href: "/spah/painel/transporte-escolar/denuncias",
      icon: AlertTriangle,
      stats: pendingReports > 0 ? `${pendingReports} pendentes` : "Nenhuma pendente",
      alert: pendingReports > 0,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Transporte Escolar | Admin</title>
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bus className="h-8 w-8 text-primary" />
            Transporte Escolar
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o módulo de transporte escolar de Cotia
          </p>
        </div>

        {/* Alert: No schools */}
        {!isLoading && activeSchools === 0 && (
          <Alert variant="destructive" className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-100">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Nenhuma escola cadastrada</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Importe o catálogo de escolas antes de começar a receber cadastros de transportadores.</span>
              <Link to="/spah/painel/transporte-escolar/escolas">
                <Button size="sm" variant="outline" className="gap-2 ml-4">
                  <Upload className="h-4 w-4" />
                  Importar Escolas
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Escolas Ativas</CardDescription>
              <CardTitle className="text-3xl">
                {schoolsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeSchools}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Transportadores Ativos</CardDescription>
              <CardTitle className="text-3xl">
                {transportersLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeTransporters}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Leads Novos</CardDescription>
              <CardTitle className="text-3xl">
                {leadsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : newLeads}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Denúncias Pendentes</CardDescription>
              <CardTitle className="text-3xl">
                {reportsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : pendingReports}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          {menuItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${item.alert ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                        <item.icon className={`h-6 w-6 ${item.alert ? 'text-destructive' : 'text-primary'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className={`text-sm mt-1 ${item.alert ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          {item.stats}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* External Link */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Página Pública</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize a página pública do módulo de transporte escolar
                </p>
              </div>
              <Link to="/transporte-escolar" target="_blank">
                <Button variant="outline">Abrir</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
