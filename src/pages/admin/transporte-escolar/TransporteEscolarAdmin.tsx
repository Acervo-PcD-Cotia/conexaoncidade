import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bus, School, Users, MessageSquare, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
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
      href: "/admin/transporte-escolar/escolas",
      icon: School,
      stats: `${activeSchools} ativas`,
    },
    {
      title: "Transportadores",
      description: "Aprovar e gerenciar transportadores",
      href: "/admin/transporte-escolar/transportadores",
      icon: Users,
      stats: pendingTransporters > 0 ? `${pendingTransporters} pendentes` : `${activeTransporters} ativos`,
      alert: pendingTransporters > 0,
    },
    {
      title: "Leads",
      description: "Solicitações de pais",
      href: "/admin/transporte-escolar/leads",
      icon: MessageSquare,
      stats: newLeads > 0 ? `${newLeads} novos` : "Nenhum novo",
      alert: newLeads > 0,
    },
    {
      title: "Denúncias",
      description: "Gerenciar denúncias",
      href: "/admin/transporte-escolar/denuncias",
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
