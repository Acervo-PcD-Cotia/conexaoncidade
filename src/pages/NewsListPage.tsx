import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNews } from '@/hooks/useNews';
import { useCategories } from '@/hooks/useCategories';
import { NewsCardVisual } from '@/components/home/NewsCardVisual';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Filter, Newspaper } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function NewsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const categoryFilter = searchParams.get('categoria') || '';
  const sortBy = searchParams.get('ordem') || 'recentes';

  const { data: allNews = [], isLoading } = useNews(200); // Fetch more for pagination
  const { data: categories = [] } = useCategories();

  // Filter by category
  const filteredNews = useMemo(() => {
    let result = [...allNews];
    
    if (categoryFilter) {
      result = result.filter(n => n.category?.slug === categoryFilter);
    }
    
    // Sort
    if (sortBy === 'populares') {
      result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }
    // 'recentes' is already the default order from the hook
    
    return result;
  }, [allNews, categoryFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const paginatedNews = filteredNews.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('categoria', value);
    } else {
      params.delete('categoria');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('ordem', value);
    params.set('page', '1');
    setSearchParams(params);
  };

  const selectedCategory = categories.find(c => c.slug === categoryFilter);

  return (
    <>
      <Helmet>
        <title>Todas as Notícias | Conexão na Cidade</title>
        <meta name="description" content="Confira todas as notícias do Portal Conexão na Cidade. Acompanhe as últimas atualizações de Itapetininga e região." />
        <link rel="canonical" href="https://conexaonacidade.com.br/noticias" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-8">
          <div className="container">
            <div className="flex items-center gap-3 mb-2">
              <Newspaper className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Todas as Notícias</h1>
            </div>
            <p className="text-primary-foreground/80">
              {filteredNews.length} notícia{filteredNews.length !== 1 ? 's' : ''} encontrada{filteredNews.length !== 1 ? 's' : ''}
              {selectedCategory && (
                <> na categoria <strong>{selectedCategory.name}</strong></>
              )}
            </p>
          </div>
        </header>

        {/* Filters */}
        <div className="border-b bg-card">
          <div className="container py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filtrar:</span>
                
                {/* Category Pills - Mobile Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 max-w-full">
                  <Badge
                    variant={!categoryFilter ? "default" : "outline"}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleCategoryChange('all')}
                  >
                    Todas
                  </Badge>
                  {categories.slice(0, 6).map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={categoryFilter === cat.slug ? "default" : "outline"}
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => handleCategoryChange(cat.slug)}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">Ordenar:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recentes">Mais recentes</SelectItem>
                    <SelectItem value="populares">Mais lidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <main className="container py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : paginatedNews.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhuma notícia encontrada</h2>
              <p className="text-muted-foreground mb-4">
                {categoryFilter 
                  ? 'Não há notícias nesta categoria ainda.'
                  : 'Não há notícias publicadas ainda.'}
              </p>
              {categoryFilter && (
                <Button variant="outline" onClick={() => handleCategoryChange('all')}>
                  Ver todas as notícias
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedNews.map((news) => (
                  <NewsCardVisual key={news.id} news={news} showActions={false} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-10" aria-label="Paginação">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <span className="text-sm text-muted-foreground ml-2">
                    Página {page} de {totalPages}
                  </span>
                </nav>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
