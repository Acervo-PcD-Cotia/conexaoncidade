import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Newspaper, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrGeneratedNewsBySlug } from "@/hooks/useBrasileiraoNews";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const NEWS_TYPE_LABELS: Record<string, string> = {
  'round_recap': 'Resumo da Rodada',
  'standings_change': 'Classificação',
  'where_to_watch': 'Onde Assistir',
  'preview': 'Prévia',
  'highlight': 'Destaque',
};

export default function GeneratedNewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: news, isLoading, error } = useBrGeneratedNewsBySlug(slug || '');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Notícia não encontrada</h1>
        <Button asChild>
          <Link to="/esportes/brasileirao">Voltar ao Brasileirão</Link>
        </Button>
      </div>
    );
  }

  const publishedDate = news.published_at ? new Date(news.published_at) : new Date(news.created_at);

  // Schema.org for SEO
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": news.seo_title || news.title,
    "description": news.seo_description,
    "datePublished": news.published_at || news.created_at,
    "dateModified": news.updated_at,
    "author": {
      "@type": "Organization",
      "name": "Portal Conexão na Cidade"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Portal Conexão na Cidade",
      "logo": {
        "@type": "ImageObject",
        "url": "https://conexaoncidade.lovable.app/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://conexaoncidade.lovable.app/esportes/brasileirao/noticia/${news.slug}`
    }
  };

  return (
    <>
      <Helmet>
        <title>{news.seo_title || news.title} | Brasileirão - Conexão na Cidade</title>
        <meta name="description" content={news.seo_description || ''} />
        <meta property="og:title" content={news.seo_title || news.title} />
        <meta property="og:description" content={news.seo_description || ''} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={news.published_at || news.created_at} />
        <link rel="canonical" href={`https://conexaoncidade.lovable.app/esportes/brasileirao/noticia/${news.slug}`} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/esportes/brasileirao" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Brasileirão
            </Link>
          </Button>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="border-primary text-primary">
              <Trophy className="h-3 w-3 mr-1" />
              Brasileirão
            </Badge>
            <Badge variant="secondary">
              {NEWS_TYPE_LABELS[news.news_type] || news.news_type}
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {news.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(publishedDate, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
            </span>
            <span className="flex items-center gap-1">
              <Newspaper className="h-4 w-4" />
              Portal Conexão na Cidade
            </span>
          </div>
        </header>

        {/* Content */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <article 
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-p:text-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:font-semibold prose-a:underline
                prose-strong:text-foreground
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:italic prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4
                prose-ul:list-disc prose-ol:list-decimal"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </CardContent>
        </Card>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link to="/esportes/brasileirao/serie-a">
              Ver Tabela Completa
            </Link>
          </Button>
          {news.related_round && (
            <Button asChild variant="outline">
              <Link to={`/esportes/brasileirao/serie-a/rodada/${news.related_round}`}>
                Ver Rodada {news.related_round}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
