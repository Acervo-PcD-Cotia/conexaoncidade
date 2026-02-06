import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { sanitizeHtml } from "@/hooks/useSanitizedHtml";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrGeneratedNewsBySlug } from "@/hooks/useBrasileiraoNews";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCategoryTheme, getArticleThemeStyle } from "@/lib/categoryTheme";
import { ArticleHeader, ArticleDivider } from "@/components/article";

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

  // Sports category theme
  const categoryTheme = getCategoryTheme('Esportes', null);

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
  const categoryDisplay = `Esportes | ${NEWS_TYPE_LABELS[news.news_type] || 'Brasileirão'}`;

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

      <article 
        className="article-themed"
        style={getArticleThemeStyle(categoryTheme)}
      >
        {/* Back Button */}
        <div className="max-w-[820px] mx-auto px-4 md:px-6 pt-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/esportes/brasileirao" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Brasileirão
            </Link>
          </Button>
        </div>

        {/* Header */}
        <ArticleHeader
          categoryDisplay={categoryDisplay}
          title={news.title}
          authorName="Portal Conexão na Cidade"
          publishedAt={news.published_at || news.created_at}
        />

        <ArticleDivider />

        {/* Content */}
        <div className="max-w-[820px] mx-auto px-4 md:px-6 py-8">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div 
                className="prose-news max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content) }}
              />
            </CardContent>
          </Card>

          {/* Related Links */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild variant="outline" className="article-tag">
              <Link to="/esportes/brasileirao/serie-a">
                Ver Tabela Completa
              </Link>
            </Button>
            {news.related_round && (
              <Button asChild variant="outline" className="article-tag">
                <Link to={`/esportes/brasileirao/serie-a/rodada/${news.related_round}`}>
                  Ver Rodada {news.related_round}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
