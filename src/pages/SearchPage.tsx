import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSearchNews } from '@/hooks/useSearchNews';
import { useCategories } from '@/hooks/useCategories';
import { NewsCardVisual } from '@/components/home/NewsCardVisual';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Tag, ArrowLeft, X } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagSlug = searchParams.get('tag') || '';
  const initialTerm = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('categoria') || '';

  const [searchInput, setSearchInput] = useState(initialTerm);

  const { data: categories = [] } = useCategories();
  const { data: searchResult, isLoading } = useSearchNews({
    term: initialTerm,
    tagSlug,
    categorySlug: categoryFilter,
    limit: 50,
  });

  const news = searchResult?.news || [];
  const foundTag = searchResult?.tag;

  // Update input when URL changes
  useEffect(() => {
    setSearchInput(initialTerm);
  }, [initialTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      const params = new URLSearchParams();
      params.set('q', searchInput.trim());
      if (categoryFilter) params.set('categoria', categoryFilter);
      setSearchParams(params);
    }
  };

  const handleClearTag = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tag');
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('categoria', value);
    } else {
      params.delete('categoria');
    }
    setSearchParams(params);
  };

  const pageTitle = foundTag 
    ? `Notícias com a tag "${foundTag.name}"` 
    : initialTerm 
      ? `Busca: "${initialTerm}"` 
      : 'Buscar Notícias';

  const pageDescription = foundTag
    ? `Confira todas as notícias marcadas com a tag ${foundTag.name} no Conexão na Cidade.`
    : initialTerm
      ? `Resultados da busca por "${initialTerm}" no Conexão na Cidade.`
      : 'Pesquise notícias no Portal Conexão na Cidade.';

  return (
    <>
      <Helmet>
        <title>{pageTitle} | Conexão na Cidade</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-8">
          <div className="container">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para a home
            </Link>

            {foundTag ? (
              <div className="flex items-center gap-3">
                <Tag className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    {foundTag.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                      onClick={handleClearTag}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </h1>
                  <p className="text-primary-foreground/80">
                    {news.length} notícia{news.length !== 1 ? 's' : ''} com esta tag
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Search className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">Buscar Notícias</h1>
                  {initialTerm && (
                    <p className="text-primary-foreground/80">
                      {news.length} resultado{news.length !== 1 ? 's' : ''} para "{initialTerm}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Search Form */}
        {!foundTag && (
          <div className="border-b bg-card">
            <div className="container py-4">
              <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Digite sua busca..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={searchInput.trim().length < 2}>
                  Buscar
                </Button>
              </form>

              {/* Category filter */}
              {initialTerm && (
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-sm text-muted-foreground">Filtrar por categoria:</span>
                  <Select value={categoryFilter || 'all'} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        <main className="container py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : !initialTerm && !tagSlug ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">O que você procura?</h2>
              <p className="text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar notícias.
              </p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h2>
              <p className="text-muted-foreground mb-4">
                {foundTag 
                  ? 'Não encontramos notícias com esta tag.'
                  : `Não encontramos notícias para "${initialTerm}".`}
              </p>
              <Button variant="outline" asChild>
                <Link to="/noticias">Ver todas as notícias</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {news.map((item) => (
                <NewsCardVisual key={item.id} news={item} showActions={false} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
