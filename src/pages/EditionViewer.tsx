import { useEffect, useMemo } from "react";
import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  Eye, 
  BookOpen,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  useDigitalEditionBySlug,
  useDigitalEditionItems,
  useRecordEditionView
} from "@/hooks/useDigitalEditions";
import { useEditionAccess } from "@/hooks/useEditionAccess";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { EditionLockedScreen } from "@/components/edition/EditionLockedScreen";
import { ShareButtons } from "@/components/news/ShareButtons";

const EditionViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { membership, isLoading: membershipLoading, hasAccess: hasCommunityAccess } = useCommunity();
  
  const { data: edition, isLoading: loadingEdition } = useDigitalEditionBySlug(slug);
  const { data: items } = useDigitalEditionItems(edition?.id);
  const recordView = useRecordEditionView();
  
  // Check access using the new hook
  const { data: accessCheck, isLoading: checkingAccess } = useEditionAccess(
    user?.id, 
    edition?.id
  );

  // Record view on mount (only if access granted)
  useEffect(() => {
    if (edition?.id && accessCheck?.has_access) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      recordView.mutate({
        editionId: edition.id,
        sessionId
      });
    }
  }, [edition?.id, accessCheck?.has_access]);

  // Group items by section
  const groupedItems = useMemo(() => {
    if (!items) return {};
    
    return items.reduce((acc, item) => {
      const section = item.section || "Geral";
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
  }, [items]);

  const sections = Object.keys(groupedItems);

  const scrollToSection = (section: string) => {
    const element = document.getElementById(`section-${section}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Loading states
  if (authLoading || loadingEdition) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando edição...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Edition not found
  if (!edition) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Edição não encontrada</h1>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>
        </Link>
      </div>
    );
  }

  // Loading access check
  if (membershipLoading || checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando acesso...</div>
      </div>
    );
  }

  // Not a community member - redirect to unlock
  if (!hasCommunityAccess && accessCheck?.reason === 'not_community_member') {
    return <Navigate to="/comunidade/desbloquear" replace />;
  }

  // Access denied due to insufficient points - show locked screen
  if (accessCheck && !accessCheck.has_access && accessCheck.reason === 'insufficient_points') {
    return <EditionLockedScreen edition={edition} accessCheck={accessCheck} />;
  }

  // Member suspended
  if (accessCheck?.reason === 'member_suspended') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Acesso Suspenso</h1>
        <p className="text-muted-foreground">Sua conta está temporariamente suspensa.</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>
        </Link>
      </div>
    );
  }

  const publishedDate = edition.published_at ? new Date(edition.published_at) : null;
  const shareUrl = `${window.location.origin}/edicao/${edition.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{edition.title} - Edição Digital</title>
        <meta name="description" content={edition.description || ""} />
        {edition.cover_image_url && <meta property="og:image" content={edition.cover_image_url} />}
      </Helmet>

      {/* Hero / Cover */}
      <div className="relative bg-muted">
        <div className="container mx-auto px-4 py-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Link>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Cover Image */}
            <div className="md:col-span-1">
              {edition.cover_image_url ? (
                <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                  <img 
                    src={edition.cover_image_url} 
                    alt={edition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-xl">
                  <BookOpen className="h-16 w-16 text-primary/40" />
                </div>
              )}
            </div>

            {/* Edition Info */}
            <div className="md:col-span-2 space-y-4">
              <Badge variant="outline">Edição Digital</Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                {edition.title}
              </h1>

              {edition.description && (
                <p className="text-lg text-muted-foreground">
                  {edition.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {publishedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(publishedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                
                {edition.view_count !== null && edition.view_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{edition.view_count} visualizações</span>
                  </div>
                )}

                {items && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{items.length} matérias</span>
                  </div>
                )}
              </div>

              {/* Share Buttons */}
              <div className="pt-4">
                <ShareButtons 
                  url={shareUrl} 
                  title={edition.title}
                  contentId={edition.id}
                  contentType="edition"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      {sections.length > 1 && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4">
            <ScrollArea className="w-full">
              <div className="flex items-center gap-2 py-3">
                <span className="text-sm font-medium text-muted-foreground mr-2">Seções:</span>
                {sections.map((section) => (
                  <Button
                    key={section}
                    variant="ghost"
                    size="sm"
                    onClick={() => scrollToSection(section)}
                    className="whitespace-nowrap"
                  >
                    {section}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Summary / TOC */}
        {sections.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Sumário
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="text-left p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="font-medium">{section}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({groupedItems[section]?.length || 0})
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sections with News */}
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section} id={`section-${section}`} className="scroll-mt-20">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">{section}</h2>
                <Separator className="flex-1" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedItems[section]?.map((item) => {
                  const news = item.news;
                  if (!news) return null;

                  const headline = item.headline_override || news.title;
                  const summary = item.summary_override || news.excerpt;

                  return (
                    <Link
                      key={item.id}
                      to={`/noticia/${news.slug}`}
                      className="group"
                    >
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                        {news.featured_image_url && (
                          <div className="aspect-video overflow-hidden">
                            <img 
                              src={news.featured_image_url} 
                              alt={headline}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {headline}
                          </h3>
                          {summary && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {summary}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-3 text-sm text-primary">
                            <span>Ler matéria</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Empty State */}
        {(!items || items.length === 0) && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-muted-foreground">
              Esta edição ainda não possui matérias
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditionViewer;
