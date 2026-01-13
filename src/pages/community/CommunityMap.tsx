import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { MapPin, Store, Accessibility, Calendar, HelpCircle, Search, Plus, Check, Star, Loader2, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { useCommunityLocations, CommunityLocation, LocationCategory } from "@/hooks/useCommunityLocations";
import { LocationMap, geocodeAddress } from "@/components/community/LocationMap";
import { LocationReviewsDialog } from "@/components/community/LocationReviewsDialog";
import { StarRating } from "@/components/community/StarRating";
import { useToast } from "@/hooks/use-toast";

const categoryLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  business: { label: "Comércio", icon: Store, color: "bg-blue-100 text-blue-700" },
  service: { label: "Serviço", icon: HelpCircle, color: "bg-green-100 text-green-700" },
  event: { label: "Evento", icon: Calendar, color: "bg-purple-100 text-purple-700" },
  support_pcd: { label: "Apoio PcD", icon: Accessibility, color: "bg-pink-100 text-pink-700" },
};

const defaultNeighborhoods = [
  "Centro", "Jardim das Flores", "Vila São João", "Parque das Nações",
  "Granja Viana", "Jardim Atalaia", "Portão", "Caucaia do Alto",
];

const accessibilityOptions = [
  "Rampa de acesso",
  "Banheiro adaptado",
  "Elevador",
  "Piso tátil",
  "Vaga PcD",
  "Intérprete de Libras",
  "Cardápio em Braille",
];

export default function CommunityMap() {
  const { locations, isLoading, neighborhoods: dbNeighborhoods, createLocation, stats } = useCommunityLocations();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<CommunityLocation | null>(null);
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "business" as LocationCategory,
    address: "",
    neighborhood: "",
    is_accessible: false,
    accessibility_features: [] as string[],
    lat: null as number | null,
    lng: null as number | null,
  });

  // Combine db neighborhoods with defaults
  const allNeighborhoods = [...new Set([...defaultNeighborhoods, ...dbNeighborhoods])].sort();

  const filteredLocations = (locations || []).filter((location) => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || location.category === selectedCategory;
    const matchesNeighborhood = selectedNeighborhood === "all" || location.neighborhood === selectedNeighborhood;
    return matchesSearch && matchesCategory && matchesNeighborhood;
  });

  const groupedByNeighborhood = filteredLocations.reduce((acc, location) => {
    const neighborhood = location.neighborhood || "Sem bairro";
    if (!acc[neighborhood]) {
      acc[neighborhood] = [];
    }
    acc[neighborhood].push(location);
    return acc;
  }, {} as Record<string, CommunityLocation[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Try to geocode if we have an address but no coordinates
    let lat = formData.lat;
    let lng = formData.lng;
    
    if (formData.address && (!lat || !lng)) {
      setIsGeocoding(true);
      const coords = await geocodeAddress(formData.address);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
      setIsGeocoding(false);
    }
    
    createLocation.mutate({
      ...formData,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          name: "",
          category: "business",
          address: "",
          neighborhood: "",
          is_accessible: false,
          accessibility_features: [],
          lat: null,
          lng: null,
        });
        toast({
          title: "Local adicionado!",
          description: lat ? "O local foi mapeado automaticamente." : "O local foi adicionado sem coordenadas.",
        });
      },
    });
  };

  const handleGeocode = async () => {
    if (!formData.address) return;
    setIsGeocoding(true);
    const coords = await geocodeAddress(formData.address);
    if (coords) {
      setFormData(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
      toast({
        title: "Endereço localizado!",
        description: "As coordenadas foram preenchidas automaticamente.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Endereço não encontrado",
        description: "Tente um endereço mais específico.",
      });
    }
    setIsGeocoding(false);
  };

  const handleLocationCardClick = (location: CommunityLocation) => {
    setSelectedLocation(location);
    setReviewsDialogOpen(true);
  };

  const toggleAccessibilityFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      accessibility_features: prev.accessibility_features.includes(feature)
        ? prev.accessibility_features.filter(f => f !== feature)
        : [...prev.accessibility_features, feature],
    }));
  };

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
        <title>Guia Na Cidade | Conexão na Cidade</title>
        <meta name="description" content="Encontre negócios, serviços e locais acessíveis em Cotia" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-pink-600" />
              Guia Na Cidade
            </h1>
            <p className="text-muted-foreground">
              {stats.total} locais cadastrados • {stats.accessible} acessíveis
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4" />
                Adicionar Local
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Local</DialogTitle>
                <DialogDescription>
                  Preencha as informações do local para adicionar ao guia
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do local *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Farmácia Popular"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: LocationCategory) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Comércio</SelectItem>
                      <SelectItem value="service">Serviço</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="support_pcd">Apoio PcD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value, lat: null, lng: null }))}
                      placeholder="Rua, número"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={handleGeocode}
                      disabled={!formData.address || isGeocoding}
                      title="Localizar no mapa"
                    >
                      {isGeocoding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.lat && formData.lng && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Coordenadas encontradas
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Select
                    value={formData.neighborhood}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, neighborhood: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o bairro" />
                    </SelectTrigger>
                    <SelectContent>
                      {allNeighborhoods.map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_accessible"
                    checked={formData.is_accessible}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_accessible: !!checked }))}
                  />
                  <Label htmlFor="is_accessible" className="cursor-pointer">
                    Local com acessibilidade
                  </Label>
                </div>

                {formData.is_accessible && (
                  <div className="space-y-2">
                    <Label>Recursos de acessibilidade</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {accessibilityOptions.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Checkbox
                            id={feature}
                            checked={formData.accessibility_features.includes(feature)}
                            onCheckedChange={() => toggleAccessibilityFeature(feature)}
                          />
                          <Label htmlFor={feature} className="text-sm cursor-pointer">
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
                    disabled={createLocation.isPending || !formData.name}
                  >
                    {createLocation.isPending ? "Salvando..." : "Adicionar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                  {allNeighborhoods.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grid">Por Bairro</TabsTrigger>
            <TabsTrigger value="list">Lista Completa</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
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
              Object.entries(groupedByNeighborhood).map(([neighborhood, locs]) => (
                <div key={neighborhood}>
                  <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-pink-600" />
                    {neighborhood}
                    <Badge variant="secondary">{locs.length}</Badge>
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {locs.map((location) => {
                      const categoryInfo = categoryLabels[location.category] || categoryLabels.business;
                      const CategoryIcon = categoryInfo.icon;
                      return (
                        <Card 
                          key={location.id} 
                          className="hover:border-pink-300 transition-colors cursor-pointer"
                          onClick={() => handleLocationCardClick(location)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <Badge className={categoryInfo.color}>
                                <CategoryIcon className="mr-1 h-3 w-3" />
                                {categoryInfo.label}
                              </Badge>
                              {location.is_accessible && (
                                <Badge variant="outline" className="border-pink-300 text-pink-700">
                                  <Accessibility className="mr-1 h-3 w-3" />
                                  Acessível
                                </Badge>
                              )}
                            </div>
                            <h3 className="mt-3 font-semibold">{location.name}</h3>
                            <p className="text-sm text-muted-foreground">{location.address || "Endereço não informado"}</p>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1 mt-2">
                              <StarRating rating={Number(location.avg_rating) || 0} size="sm" />
                              <span className="text-sm text-muted-foreground">
                                ({location.review_count || 0})
                              </span>
                            </div>
                            
                            {location.accessibility_features && location.accessibility_features.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {location.accessibility_features.map((feature) => (
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
                {filteredLocations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 font-semibold">Nenhum local encontrado</h3>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredLocations.map((location) => {
                      const categoryInfo = categoryLabels[location.category] || categoryLabels.business;
                      const CategoryIcon = categoryInfo.icon;
                      return (
                        <div key={location.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                          <div className={`rounded-full p-2 ${categoryInfo.color}`}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{location.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {location.address || "Endereço não informado"} • {location.neighborhood || "Sem bairro"}
                            </p>
                          </div>
                          {location.is_accessible && (
                            <Badge variant="outline" className="border-pink-300 text-pink-700 shrink-0">
                              <Accessibility className="mr-1 h-3 w-3" />
                              Acessível
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <Card>
              <CardContent className="p-4">
                {filteredLocations.filter(l => l.lat && l.lng).length === 0 ? (
                  <div className="p-8 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 font-semibold">Nenhum local com coordenadas</h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione locais com endereço para vê-los no mapa
                    </p>
                  </div>
                ) : (
                  <LocationMap 
                    locations={filteredLocations} 
                    onLocationClick={handleLocationCardClick}
                    className="h-[500px]"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reviews Dialog */}
        <LocationReviewsDialog
          location={selectedLocation}
          open={reviewsDialogOpen}
          onOpenChange={setReviewsDialogOpen}
        />
      </div>
    </CommunityLayout>
  );
}