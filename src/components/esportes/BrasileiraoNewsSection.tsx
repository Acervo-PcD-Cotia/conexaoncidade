import { useState } from "react";
import { Newspaper, Rss, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalNewsCard } from "@/components/esportes/ExternalNewsCard";
import { GeneratedNewsCard } from "@/components/esportes/GeneratedNewsCard";
import { useBrNewsItems, useBrGeneratedNews } from "@/hooks/useBrasileiraoNews";
import { cn } from "@/lib/utils";

interface BrasileiraoNewsSectionProps {
  className?: string;
  limit?: number;
}

export function BrasileiraoNewsSection({ className, limit = 10 }: BrasileiraoNewsSectionProps) {
  const [activeTab, setActiveTab] = useState("portal");
  
  const { data: generatedNews, isLoading: loadingGenerated } = useBrGeneratedNews('published', limit);
  const { data: geNews, isLoading: loadingGe } = useBrNewsItems('ge', limit);
  const { data: ogolNews, isLoading: loadingOgol } = useBrNewsItems('ogol', limit);

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portal" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            <span className="hidden sm:inline">Portal</span>
          </TabsTrigger>
          <TabsTrigger value="ge" className="flex items-center gap-2">
            <Rss className="h-4 w-4" />
            <span>GE</span>
          </TabsTrigger>
          <TabsTrigger value="ogol" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <span>oGol</span>
          </TabsTrigger>
        </TabsList>

        {/* Portal News */}
        <TabsContent value="portal" className="mt-4">
          {loadingGenerated ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : generatedNews && generatedNews.length > 0 ? (
            <div className="space-y-4">
              {generatedNews.map((news) => (
                <GeneratedNewsCard key={news.id} news={news} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium mb-1">Nenhuma notícia publicada</h3>
              <p className="text-sm text-muted-foreground">
                As notícias geradas pelo portal aparecerão aqui.
              </p>
            </div>
          )}
        </TabsContent>

        {/* GE News */}
        <TabsContent value="ge" className="mt-4">
          {loadingGe ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : geNews && geNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {geNews.map((news) => (
                <ExternalNewsCard key={news.id} news={news} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Rss className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium mb-1">Nenhuma notícia do GE</h3>
              <p className="text-sm text-muted-foreground">
                Sincronize o RSS para ver as últimas notícias.
              </p>
            </div>
          )}
        </TabsContent>

        {/* oGol News */}
        <TabsContent value="ogol" className="mt-4">
          {loadingOgol ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : ogolNews && ogolNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ogolNews.map((news) => (
                <ExternalNewsCard key={news.id} news={news} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ExternalLink className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium mb-1">Nenhuma notícia do oGol</h3>
              <p className="text-sm text-muted-foreground">
                Sincronize o RSS para ver as últimas notícias.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
