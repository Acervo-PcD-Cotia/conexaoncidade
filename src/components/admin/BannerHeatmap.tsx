import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MousePointer, Layers, Target } from "lucide-react";
import { format, subDays } from "date-fns";

export function BannerHeatmap() {
  const [selectedBannerId, setSelectedBannerId] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: banners = [] } = useQuery({
    queryKey: ["banners-for-heatmap"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("super_banners")
        .select("id, title, image_url")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: clicks = [] } = useQuery({
    queryKey: ["banner-clicks-heatmap", selectedBannerId, dateRange],
    queryFn: async () => {
      if (!selectedBannerId) return [];
      const { data, error } = await supabase
        .from("banner_clicks")
        .select("click_x, click_y, clicked_at")
        .eq("banner_id", selectedBannerId)
        .gte("clicked_at", `${dateRange.start}T00:00:00`)
        .lte("clicked_at", `${dateRange.end}T23:59:59`)
        .not("click_x", "is", null);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBannerId,
  });

  const selectedBanner = banners.find((b) => b.id === selectedBannerId);

  // Generate heatmap grid data (10x10 grid)
  const heatmapData = useMemo(() => {
    const grid: number[][] = Array(10)
      .fill(null)
      .map(() => Array(10).fill(0));

    clicks.forEach((click) => {
      if (click.click_x != null && click.click_y != null) {
        const gridX = Math.min(9, Math.floor(click.click_x / 10));
        const gridY = Math.min(9, Math.floor(click.click_y / 10));
        grid[gridY][gridX]++;
      }
    });

    return grid;
  }, [clicks]);

  // Get max value for color scaling
  const maxClicks = useMemo(() => {
    return Math.max(1, ...heatmapData.flat());
  }, [heatmapData]);

  // Zone statistics
  const zoneStats = useMemo(() => {
    const left = clicks.filter((c) => c.click_x != null && c.click_x < 33).length;
    const center = clicks.filter((c) => c.click_x != null && c.click_x >= 33 && c.click_x < 67).length;
    const right = clicks.filter((c) => c.click_x != null && c.click_x >= 67).length;
    const total = clicks.length || 1;

    return {
      left: { count: left, pct: Math.round((left / total) * 100) },
      center: { count: center, pct: Math.round((center / total) * 100) },
      right: { count: right, pct: Math.round((right / total) * 100) },
    };
  }, [clicks]);

  const getHeatColor = (value: number) => {
    const intensity = value / maxClicks;
    if (intensity === 0) return "rgba(0, 0, 0, 0)";
    if (intensity < 0.25) return "rgba(34, 197, 94, 0.4)"; // green
    if (intensity < 0.5) return "rgba(234, 179, 8, 0.5)"; // yellow
    if (intensity < 0.75) return "rgba(249, 115, 22, 0.6)"; // orange
    return "rgba(239, 68, 68, 0.7)"; // red
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Heatmap de Cliques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Selecionar Banner</Label>
              <Select value={selectedBannerId} onValueChange={setSelectedBannerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um banner" />
                </SelectTrigger>
                <SelectContent>
                  {banners.map((banner) => (
                    <SelectItem key={banner.id} value={banner.id}>
                      {banner.title || "Banner sem título"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          {!selectedBannerId ? (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center text-muted-foreground">
                <MousePointer className="mx-auto mb-2 h-8 w-8" />
                <p>Selecione um banner para visualizar o heatmap</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Heatmap Visualization */}
              <div className="relative overflow-hidden rounded-lg border">
                <div className="aspect-[21/9] w-full">
                  {selectedBanner?.image_url && (
                    <img
                      src={selectedBanner.image_url}
                      alt="Banner"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {/* Heatmap overlay */}
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                    {heatmapData.map((row, y) =>
                      row.map((value, x) => (
                        <div
                          key={`${x}-${y}`}
                          className="group relative transition-all hover:scale-105"
                          style={{ backgroundColor: getHeatColor(value) }}
                          title={`${value} cliques nesta área`}
                        >
                          {value > 0 && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="rounded bg-black/70 px-1 text-xs font-bold text-white">
                                {value}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <MousePointer className="mx-auto mb-2 h-6 w-6 text-primary" />
                    <div className="text-2xl font-bold">{clicks.length}</div>
                    <div className="text-xs text-muted-foreground">Total de Cliques</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Layers className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                    <div className="text-2xl font-bold">{zoneStats.left.pct}%</div>
                    <div className="text-xs text-muted-foreground">Zona Esquerda</div>
                    <Badge variant="outline" className="mt-1">
                      {zoneStats.left.count} cliques
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Layers className="mx-auto mb-2 h-6 w-6 text-green-500" />
                    <div className="text-2xl font-bold">{zoneStats.center.pct}%</div>
                    <div className="text-xs text-muted-foreground">Zona Central</div>
                    <Badge variant="outline" className="mt-1">
                      {zoneStats.center.count} cliques
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Layers className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                    <div className="text-2xl font-bold">{zoneStats.right.pct}%</div>
                    <div className="text-xs text-muted-foreground">Zona Direita</div>
                    <Badge variant="outline" className="mt-1">
                      {zoneStats.right.count} cliques
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 rounded-lg border p-4">
                <span className="text-sm text-muted-foreground">Densidade:</span>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-8 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.4)" }} />
                  <span className="text-xs">Baixa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-8 rounded" style={{ backgroundColor: "rgba(234, 179, 8, 0.5)" }} />
                  <span className="text-xs">Média</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-8 rounded" style={{ backgroundColor: "rgba(249, 115, 22, 0.6)" }} />
                  <span className="text-xs">Alta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-8 rounded" style={{ backgroundColor: "rgba(239, 68, 68, 0.7)" }} />
                  <span className="text-xs">Muito Alta</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
