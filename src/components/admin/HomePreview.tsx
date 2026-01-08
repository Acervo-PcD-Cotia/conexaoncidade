import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Monitor, Tablet, Smartphone, Eye, EyeOff, TrendingUp, Zap, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface HomeBlock {
  id: string;
  block_name: string;
  block_type: string;
  title: string | null;
  category_id: string | null;
  tag_id: string | null;
  item_count: number;
  is_active: boolean;
  sort_order: number;
  news_ids: string[] | null;
}

interface PreviewProps {
  blocks: HomeBlock[];
  categories?: { id: string; name: string; color: string }[];
  tags?: { id: string; name: string }[];
}

type ViewMode = "desktop" | "tablet" | "mobile";

export function HomePreview({ blocks, categories, tags }: PreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  
  const activeBlocks = blocks.filter(b => b.is_active).sort((a, b) => a.sort_order - b.sort_order);

  const viewModeStyles: Record<ViewMode, string> = {
    desktop: "w-full",
    tablet: "w-[768px] mx-auto",
    mobile: "w-[375px] mx-auto",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Preview em Tempo Real</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "desktop" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("desktop")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "tablet" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("tablet")}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "mobile" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <ScrollArea className="flex-1 bg-background">
        <div className={cn("min-h-full bg-background transition-all duration-300", viewModeStyles[viewMode])}>
          {/* Mock Header */}
          <div className="border-b bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-primary/20 rounded" />
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>

          {/* Blocks Preview */}
          <div className="space-y-4 p-4">
            {activeBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <EyeOff className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">Nenhum bloco ativo para exibir</p>
              </div>
            ) : (
              activeBlocks.map((block) => (
                <PreviewBlock 
                  key={block.id} 
                  block={block} 
                  categories={categories}
                  tags={tags}
                  viewMode={viewMode}
                />
              ))
            )}
          </div>

          {/* Mock Footer */}
          <div className="border-t bg-muted/50 p-4 mt-8">
            <div className="h-4 w-48 bg-muted rounded mx-auto" />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

interface PreviewBlockProps {
  block: HomeBlock;
  categories?: { id: string; name: string; color: string }[];
  tags?: { id: string; name: string }[];
  viewMode: ViewMode;
}

function PreviewBlock({ block, categories, tags, viewMode }: PreviewBlockProps) {
  // Fetch real data for preview
  const { data: previewNews } = useQuery({
    queryKey: ["preview-news", block.id, block.block_type, block.news_ids, block.category_id, block.tag_id],
    queryFn: async () => {
      if (block.block_type === "curated" && block.news_ids?.length) {
        const { data } = await supabase
          .from("news")
          .select("id, title, slug, featured_image_url, category_id")
          .in("id", block.news_ids)
          .eq("status", "published");
        
        // Maintain order
        return block.news_ids
          .map(id => data?.find(n => n.id === id))
          .filter(Boolean);
      }
      
      let query = supabase
        .from("news")
        .select("id, title, slug, featured_image_url, category_id")
        .eq("status", "published")
        .limit(block.item_count || 5);
      
      if (block.block_type === "category" && block.category_id) {
        query = query.eq("category_id", block.category_id);
      }
      
      if (block.block_type === "most_read") {
        query = query.order("view_count", { ascending: false });
      } else {
        query = query.order("published_at", { ascending: false });
      }
      
      const { data } = await query;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: quickNotes } = useQuery({
    queryKey: ["preview-quick-notes", block.id],
    queryFn: async () => {
      if (block.block_type !== "quick_notes") return [];
      const { data } = await supabase
        .from("quick_notes")
        .select("id, title, category_id")
        .eq("is_active", true)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(block.item_count || 12);
      return data || [];
    },
    enabled: block.block_type === "quick_notes",
    staleTime: 30000,
  });

  const category = categories?.find(c => c.id === block.category_id);
  const tag = tags?.find(t => t.id === block.tag_id);
  
  const isMobile = viewMode === "mobile";
  const isTablet = viewMode === "tablet";

  const getBlockIcon = () => {
    switch (block.block_type) {
      case "most_read":
        return <TrendingUp className="h-3 w-3" />;
      case "quick_notes":
        return <Zap className="h-3 w-3" />;
      default:
        return <Newspaper className="h-3 w-3" />;
    }
  };

  const renderBlockContent = () => {
    switch (block.block_type) {
      case "most_read":
        return (
          <div className="divide-y divide-border">
            {(previewNews || []).slice(0, 5).map((item: any, index: number) => (
              <div key={item.id} className="flex items-start gap-2 py-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 font-heading text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-xs line-clamp-2">{item.title}</span>
              </div>
            ))}
          </div>
        );

      case "quick_notes":
        return (
          <div className={cn(
            "grid gap-1",
            isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-3"
          )}>
            {(quickNotes || []).map((note: any) => {
              const noteCategory = categories?.find(c => c.id === note.category_id);
              return (
                <div key={note.id} className="flex items-center gap-1.5 px-2 py-1 text-[10px] hover:bg-muted/50 rounded">
                  <span
                    className="h-1 w-1 rounded-full shrink-0"
                    style={{ backgroundColor: noteCategory?.color || "hsl(var(--primary))" }}
                  />
                  <span className="line-clamp-1">{note.title}</span>
                </div>
              );
            })}
          </div>
        );

      case "curated":
      case "category":
      case "tag":
      case "latest":
      default:
        return (
          <div className={cn(
            "grid gap-3",
            isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-3"
          )}>
            {(previewNews || []).slice(0, block.item_count || 6).map((item: any) => {
              const itemCategory = categories?.find(c => c.id === item.category_id);
              return (
                <div key={item.id} className="rounded-lg border bg-card overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {item.featured_image_url ? (
                      <img 
                        src={item.featured_image_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Newspaper className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                    {itemCategory && (
                      <Badge 
                        className="absolute top-2 left-2 text-[9px] px-1.5 py-0"
                        style={{ backgroundColor: itemCategory.color }}
                      >
                        {itemCategory.name}
                      </Badge>
                    )}
                  </div>
                  <div className="p-2">
                    <h4 className="text-xs font-medium line-clamp-2">{item.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Block Header */}
      <div className="flex items-center gap-2 border-b px-3 py-2 bg-muted/30">
        <span className="text-primary">{getBlockIcon()}</span>
        <h3 className="text-xs font-bold uppercase tracking-wide">
          {block.title || block.block_name}
        </h3>
        {category && (
          <Badge variant="outline" className="text-[9px] ml-auto" style={{ borderColor: category.color, color: category.color }}>
            {category.name}
          </Badge>
        )}
        {tag && (
          <Badge variant="outline" className="text-[9px] ml-auto">
            #{tag.name}
          </Badge>
        )}
      </div>

      {/* Block Content */}
      <div className="p-3">
        {renderBlockContent()}
      </div>
    </div>
  );
}
