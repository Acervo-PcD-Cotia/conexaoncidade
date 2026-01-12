import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Globe,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface GeoRule {
  id: string;
  banner_id: string;
  rule_type: "include" | "exclude";
  country_codes: string[];
  region_codes: string[];
  cities: string[];
  priority: number;
  is_active: boolean;
  created_at: string;
}

interface BannerGeoTargetingProps {
  bannerId: string;
  bannerTitle: string;
}

const COUNTRIES = [
  { code: "BR", name: "Brasil" },
  { code: "PT", name: "Portugal" },
  { code: "US", name: "Estados Unidos" },
  { code: "AR", name: "Argentina" },
  { code: "UY", name: "Uruguai" },
  { code: "PY", name: "Paraguai" },
];

const BR_STATES = [
  { code: "SP", name: "São Paulo" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "MG", name: "Minas Gerais" },
  { code: "BA", name: "Bahia" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "PR", name: "Paraná" },
  { code: "SC", name: "Santa Catarina" },
  { code: "PE", name: "Pernambuco" },
  { code: "CE", name: "Ceará" },
  { code: "GO", name: "Goiás" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "PA", name: "Pará" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "PB", name: "Paraíba" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "AL", name: "Alagoas" },
  { code: "PI", name: "Piauí" },
  { code: "SE", name: "Sergipe" },
  { code: "RO", name: "Rondônia" },
  { code: "TO", name: "Tocantins" },
  { code: "AC", name: "Acre" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "RR", name: "Roraima" },
];

export function BannerGeoTargeting({ bannerId, bannerTitle }: BannerGeoTargetingProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ruleType, setRuleType] = useState<"include" | "exclude">("include");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [cities, setCities] = useState<string[]>([]);

  // Fetch geo rules for this banner
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["banner-geo-rules", bannerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_geo_rules")
        .select("*")
        .eq("banner_id", bannerId)
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as GeoRule[];
    },
  });

  // Create rule mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("banner_geo_rules").insert({
        banner_id: bannerId,
        rule_type: ruleType,
        country_codes: selectedCountries,
        region_codes: selectedRegions,
        cities: cities,
        priority: rules.length,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-geo-rules", bannerId] });
      toast.success("Regra de geo-targeting criada");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar regra: " + error.message);
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("banner_geo_rules")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-geo-rules", bannerId] });
    },
  });

  // Delete rule mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banner_geo_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-geo-rules", bannerId] });
      toast.success("Regra excluída");
    },
  });

  const resetForm = () => {
    setRuleType("include");
    setSelectedCountries([]);
    setSelectedRegions([]);
    setCities([]);
    setCityInput("");
  };

  const handleAddCity = () => {
    if (cityInput.trim() && !cities.includes(cityInput.trim())) {
      setCities([...cities, cityInput.trim()]);
      setCityInput("");
    }
  };

  const handleRemoveCity = (city: string) => {
    setCities(cities.filter((c) => c !== city));
  };

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  const toggleRegion = (code: string) => {
    setSelectedRegions((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Geo-Targeting</h3>
          <p className="text-sm text-muted-foreground">
            Configure regras de exibição por região para: {bannerTitle}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Regra de Geo-Targeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Rule Type */}
              <div className="space-y-2">
                <Label>Tipo de Regra</Label>
                <Select value={ruleType} onValueChange={(v: "include" | "exclude") => setRuleType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="include">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Incluir - Exibir apenas nestas regiões
                      </div>
                    </SelectItem>
                    <SelectItem value="exclude">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-600" />
                        Excluir - Não exibir nestas regiões
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Countries */}
              <div className="space-y-2">
                <Label>Países</Label>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map((country) => (
                    <Badge
                      key={country.code}
                      variant={selectedCountries.includes(country.code) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCountry(country.code)}
                    >
                      {country.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Brazilian States */}
              {selectedCountries.includes("BR") && (
                <div className="space-y-2">
                  <Label>Estados (Brasil)</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                    {BR_STATES.map((state) => (
                      <Badge
                        key={state.code}
                        variant={selectedRegions.includes(state.code) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleRegion(state.code)}
                      >
                        {state.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Cities */}
              <div className="space-y-2">
                <Label>Cidades (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Nome da cidade"
                    onKeyPress={(e) => e.key === "Enter" && handleAddCity()}
                  />
                  <Button type="button" variant="outline" onClick={handleAddCity}>
                    Adicionar
                  </Button>
                </div>
                {cities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cities.map((city) => (
                      <Badge key={city} variant="secondary" className="gap-1">
                        {city}
                        <button onClick={() => handleRemoveCity(city)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || (selectedCountries.length === 0 && selectedRegions.length === 0 && cities.length === 0)}
                className="w-full"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4 mr-2" />
                )}
                Criar Regra
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma regra de geo-targeting configurada</p>
            <p className="text-sm mt-2">
              O banner será exibido para todos os usuários
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.rule_type === "include" ? "default" : "destructive"}>
                        {rule.rule_type === "include" ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Incluir
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Excluir
                          </>
                        )}
                      </Badge>
                      {!rule.is_active && (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm">
                      {rule.country_codes?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {rule.country_codes.map((code) => (
                            <Badge key={code} variant="outline" className="text-xs">
                              {COUNTRIES.find((c) => c.code === code)?.name || code}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {rule.region_codes?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {rule.region_codes.slice(0, 3).map((code) => (
                            <Badge key={code} variant="outline" className="text-xs">
                              {BR_STATES.find((s) => s.code === code)?.name || code}
                            </Badge>
                          ))}
                          {rule.region_codes.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{rule.region_codes.length - 3} mais
                            </span>
                          )}
                        </div>
                      )}
                      {rule.cities?.length > 0 && (
                        <div className="flex items-center gap-1">
                          {rule.cities.slice(0, 3).map((city) => (
                            <Badge key={city} variant="outline" className="text-xs">
                              {city}
                            </Badge>
                          ))}
                          {rule.cities.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{rule.cities.length - 3} mais
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: rule.id, isActive: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
