import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocialPosts, STATUS_LABELS, STATUS_COLORS } from "@/hooks/useSocialPosts";
import { PLATFORM_LABELS, PLATFORM_ICONS, SocialPlatform } from "@/hooks/useSocialAccounts";
import { 
  ExternalLink,
  Image as ImageIcon,
  RotateCcw 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SocialHistory() {
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | undefined>(undefined);
  
  const { posts, isLoading, retryPost } = useSocialPosts({ 
    status: ['posted', 'failed', 'cancelled'],
    platform: platformFilter,
    limit: 100 
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico de Publicações</h1>
        <p className="text-muted-foreground">
          Visualize posts publicados, falhas e cancelados
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select 
          value={platformFilter ?? 'all'} 
          onValueChange={(v) => setPlatformFilter(v === 'all' ? undefined : v as SocialPlatform)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas as redes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as redes</SelectItem>
            {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {PLATFORM_ICONS[key as SocialPlatform]} {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : !posts || posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum histórico encontrado
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {post.payload?.image ? (
                      <img 
                        src={post.payload.image} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {PLATFORM_ICONS[post.platform]}
                          </span>
                          <span className="text-sm font-medium">
                            {PLATFORM_LABELS[post.platform]}
                          </span>
                          <Badge className={STATUS_COLORS[post.status]}>
                            {STATUS_LABELS[post.status]}
                          </Badge>
                        </div>
                        <h3 className="font-medium line-clamp-1">
                          {post.news?.title ?? 'Notícia removida'}
                        </h3>
                      </div>
                      
                      <div className="text-xs text-muted-foreground text-right">
                        {post.posted_at ? (
                          <span>
                            Publicado em {format(new Date(post.posted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        ) : (
                          <span>
                            Criado em {format(new Date(post.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>

                    {post.error_message && (
                      <p className="text-sm text-destructive mt-2">
                        Erro: {post.error_message}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {post.status === 'failed' && post.retries_count < 3 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => retryPost.mutate(post.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Tentar novamente
                        </Button>
                      )}
                      
                      {post.external_post_url && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          asChild
                        >
                          <a href={post.external_post_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver post
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
