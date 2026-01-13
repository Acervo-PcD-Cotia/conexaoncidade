import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { MapPin, Store, Accessibility, Calendar, HelpCircle, Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityLayout } from "@/components/community/CommunityLayout";

interface Location {
  id: string;
  name: string;
  category: "business" | "service" | "event" | "support_pcd";
  address: string;
  neighborhood: string;
  isAccessible: boolean;
  accessibilityFeatures?: string[];
}

const categoryLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  business: { label: "Comércio", icon: Store, color: "bg-blue-100 text-blue-700" },
  service: { label: "Serviço", icon: HelpCircle, color: "bg-green-100 text-green-700" },
  event: { label: "Evento", icon: Calendar, color: "bg-purple-100 text-purple-700" },
  support_pcd: { label: "Apoio PcD", icon: Accessibility, color: "bg-pink-100 text-pink-700" },
};

const neighborhoods = [
  "Centro", "Jardim das Flores", "Vila São João", "Parque das Nações",
  "Granja Viana", "Jardim Atalaia", "Portão", "Caucaia do Alto",
];

// Placeholder data - will be replaced with real data from database
const placeholderLocations: Location[] = [
  {
    id: "1",
    name: "Farmácia Popular",
    category: "business",
    address: "Rua Principal, 123",
    neighborhood: "Centro",
    isAccessible: true,
    accessibilityFeatures: ["Rampa de acesso", "Banheiro adaptado"],
  },
  {
    id: "2",
    name: "CRAS Centro",
    category: "service",
    address: "Av. Central, 456",
    neighborhood: "Centro",
    isAccessible: true,
    accessibilityFeatures: ["Elevador", "Intérprete de Libras"],
  },
  {
    id: "3",
    name: "Associação PcD Cotia",
    category: "support_pcd",
    address: "Rua das Flores, 789",
    neighborhood: "Jardim das Flores",
    isAccessible: true,
    accessibilityFeatures: ["Rampa", "Piso tátil", "Banheiro adaptado"],
  },
];

export default function CommunityMap() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("all");
  const [isLoading] = useState(false);

  const filteredLocations = placeholderLocations.filter((location) => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || location.category === selectedCategory;
    const matchesNeighborhood = selectedNeighborhood === "all" || location.neighborhood === selectedNeighborhood;
    return matchesSearch && matchesCategory && matchesNeighborhood;
  });

  const groupedByNeighborhood = filteredLocations.reduce((acc, location) => {
    if (!acc[location.neighborhood]) {
      acc[location.neighborhood] = [];
    }
    acc[location.neighborhood].push(location);
    return acc;
  }, {} as Record<string, Location[]>);

  if (isLoading) {
    return (
      <CommunityLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <Helmet>
        <title>Mapa da Comunidade | Conexão na Cidade</title>
        <meta name="description" content="Encontre negócios, serviços e locais acessíveis em Cotia" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-pink-600" />
              Mapa da Comunidade
            </h1>
            <p className="text-muted-foreground">
              Encontre locais, serviços e pontos de apoio na cidade
            </p>
          </div>
          <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4" />
            Adicionar Local
          </Button>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="all">Todas categorias</option>
                  <option value="business">Comércio</option>
                  <option value="service">Serviços</option>
                  <option value="event">Eventos</option>
                  <option value="support_pcd">Apoio PcD</option>
                </select>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="all">Todos bairros</option>
                  {neighborhoods.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Por Bairro</TabsTrigger>
            <TabsTrigger value="list">Lista Completa</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-4 space-y-6">
            {Object.keys(groupedByNeighborhood).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 font-semibold">Nenhum local encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros ou adicione um novo local
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedByNeighborhood).map(([neighborhood, locations]) => (
                <div key={neighborhood}>
                  <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-pink-600" />
                    {neighborhood}
                    <Badge variant="secondary">{locations.length}</Badge>
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {locations.map((location) => {
                      const categoryInfo = categoryLabels[location.category];
                      const CategoryIcon = categoryInfo.icon;
                      return (
                        <Card key={location.id} className="hover:border-pink-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <Badge className={categoryInfo.color}>
                                <CategoryIcon className="mr-1 h-3 w-3" />
                                {categoryInfo.label}
                              </Badge>
                              {location.isAccessible && (
                                <Badge variant="outline" className="border-pink-300 text-pink-700">
                                  <Accessibility className="mr-1 h-3 w-3" />
                                  Acessível
                                </Badge>
                              )}
                            </div>
                            <h3 className="mt-3 font-semibold">{location.name}</h3>
                            <p className="text-sm text-muted-foreground">{location.address}</p>
                            {location.accessibilityFeatures && location.accessibilityFeatures.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {location.accessibilityFeatures.map((feature) => (
                                  <Badge key={feature} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredLocations.map((location) => {
                    const categoryInfo = categoryLabels[location.category];
                    const CategoryIcon = categoryInfo.icon;
                    return (
                      <div key={location.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                        <div className={`rounded-full p-2 ${categoryInfo.color}`}>
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{location.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {location.address} • {location.neighborhood}
                          </p>
                        </div>
                        {location.isAccessible && (
                          <Badge variant="outline" className="border-pink-300 text-pink-700 shrink-0">
                            <Accessibility className="mr-1 h-3 w-3" />
                            Acessível
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Coming Soon Notice */}
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-2 font-semibold">Integração com Google Maps em breve</h3>
            <p className="text-sm text-muted-foreground">
              Em breve você poderá ver todos os locais em um mapa interativo
            </p>
          </CardContent>
        </Card>
      </div>
    </CommunityLayout>
  );
}
