import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Eye, User, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function BlogPage() {
  const { data: posts, isLoading } = useBlogPosts();

  const featured = posts?.[0];
  const rest = posts?.slice(1) || [];

  return (
    <>
      <Helmet>
        <title>Blog | Conexão na Cidade</title>
        <meta name="description" content="Artigos, dicas e conteúdos exclusivos do Conexão na Cidade para a região de Cotia e Grande São Paulo." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-20">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Artigos, dicas e conteúdos exclusivos para você e seu negócio na região de Cotia.
            </p>
          </div>
        </section>

        <div className="container py-10 md:py-16">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : !posts?.length ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Nenhum post publicado no blog ainda.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featured && (
                <Link
                  to={`/blog/${featured.slug}`}
                  className="group block mb-12"
                >
                  <article className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-lg transition-shadow">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
                        {featured.featured_image_url ? (
                          <img
                            src={featured.featured_image_url}
                            alt={featured.image_alt || featured.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full min-h-[280px] bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-4xl">📝</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 md:p-10 flex flex-col justify-center">
                        {featured.category && (
                          <Badge variant="secondary" className="w-fit mb-3 text-xs">
                            {(featured.category as any).name}
                          </Badge>
                        )}
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-3">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="text-muted-foreground mb-4 line-clamp-3">{featured.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {featured.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(featured.published_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </span>
                          )}
                          {featured.editor_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {featured.editor_name}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary">
                          Ler artigo <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                      <article className="h-full flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-[16/10] overflow-hidden">
                          {post.featured_image_url ? (
                            <img
                              src={post.featured_image_url}
                              alt={post.image_alt || post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-2xl">📝</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          {post.category && (
                            <Badge variant="secondary" className="w-fit mb-2 text-xs">
                              {(post.category as any).name}
                            </Badge>
                          )}
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{post.excerpt}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                            {post.published_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(post.published_at), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.view_count || 0}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
