import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PlayCircle, Eye, Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebStories, WebStory } from "@/hooks/useWebStories";

export default function StoriesPage() {
  const { data: stories, isLoading } = useWebStories(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Filter stories based on search
  const filteredStories = stories?.filter((story) => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  // Get unique categories from story titles (extracting keywords)
  const filters = ["Recentes", "Mais Vistos", "Destaques"];

  // Sort based on filter
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (selectedFilter === "Mais Vistos") {
      return (b.view_count || 0) - (a.view_count || 0);
    }
    // Default: most recent by published_at
    return new Date(b.published_at || 0).getTime() - 
           new Date(a.published_at || 0).getTime();
  });

  return (
    <>
      <Helmet>
        <title>Web Stories | Portal de Notícias</title>
        <meta
          name="description"
          content="Explore nossas Web Stories: histórias visuais e interativas sobre as principais notícias do dia."
        />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero Section */}
        <section className="container py-8 md:py-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <PlayCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Web Stories</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Histórias visuais e interativas sobre as principais notícias
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-2xl mx-auto mt-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedFilter(selectedFilter === filter ? null : filter)
                  }
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="container pb-12">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[9/16] bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : sortedStories.length === 0 ? (
            <div className="text-center py-16">
              <PlayCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Nenhuma story encontrada
              </h2>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Tente buscar com outros termos"
                  : "Em breve teremos novas histórias para você"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {sortedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function StoryCard({ story }: { story: WebStory }) {
  return (
    <Link
      to={`/story/${story.slug}`}
      className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-muted shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
    >
      {/* Background Image */}
      <img
        src={
          story.cover_image_url ||
          "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=700&fit=crop"
        }
        alt={story.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Play Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          <PlayCircle className="h-10 w-10 text-primary" />
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
        <h3 className="font-bold text-white line-clamp-3 text-shadow">
          {story.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-2">
          {story.view_count > 0 && (
            <Badge variant="secondary" className="text-[10px] gap-1 bg-white/20 text-white border-0">
              <Eye className="h-3 w-3" />
              {story.view_count.toLocaleString("pt-BR")}
            </Badge>
          )}
        </div>
      </div>

      {/* Ring on top for story indicator */}
      <div className="absolute top-3 left-3 right-3">
        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-white rounded-full" />
        </div>
      </div>
    </Link>
  );
}
