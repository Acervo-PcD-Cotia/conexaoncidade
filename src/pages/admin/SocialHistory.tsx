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
import { useSocialPosts, STATUS_LABELS, STATUS_COLORS, SocialPost } from "@/hooks/useSocialPosts";
import { PLATFORM_LABELS, PLATFORM_ICONS, SocialPlatform } from "@/hooks/useSocialAccounts";
import type { PostGlobalStatus } from "@/types/postsocial";
import { 
  ExternalLink,
  Image as ImageIcon,
  RotateCcw 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SocialHistory() {
  const [originFilter, setOriginFilter] = useState<SocialPost['origin_type'] | undefined>(undefined);
  
  const { posts, isLoading, retryPost } = useSocialPosts({ 
    status: ['done', 'failed'] as PostGlobalStatus[],
    originType: originFilter,
    limit: 100 
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico de Publicações</h1>
        <p className="text-muted-foreground">
          Visualize posts publicados e falhas
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select 
          value={originFilter ?? 'all'} 
          onValueChange={(v) => setOriginFilter(v === 'all' ? undefined : v as SocialPost['origin_type'])}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas as origens" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as origens</SelectItem>
            <SelectItem value="news">Notícias</SelectItem>
            <SelectItem value="ad">Anúncios</SelectItem>
            <SelectItem value="publidoor">Publidoor</SelectItem>
            <SelectItem value="campaign360">Campanha 360</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
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
          {posts.map((post) => {
            const firstTarget = post.targets?.[0];
            const platform = firstTarget?.social_account?.platform;
            const postedAt = firstTarget?.posted_at;
            const providerUrl = firstTarget?.provider_post_url;
            const errorMessage = firstTarget?.error_message;
            const attempts = firstTarget?.attempts ?? 0;
            const media = post.media_json?.[0];

            return (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {media?.url ? (
                        <img 
                          src={media.url} 
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
                              {platform ? PLATFORM_ICONS[platform] : '📱'}
                            </span>
                            <span className="text-sm font-medium">
                              {platform ? PLATFORM_LABELS[platform] : `${post.targets?.length ?? 0} redes`}
                            </span>
                            <Badge className={STATUS_COLORS[post.status_global]}>
                              {STATUS_LABELS[post.status_global]}
                            </Badge>
                          </div>
                          <h3 className="font-medium line-clamp-1">
                            {post.title}
                          </h3>
                        </div>
                        
                        <div className="text-xs text-muted-foreground text-right">
                          {postedAt ? (
                            <span>
                              Publicado em {format(new Date(postedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          ) : (
                            <span>
                              Criado em {format(new Date(post.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          )}
                        </div>
                      </div>

                      {errorMessage && (
                        <p className="text-sm text-destructive mt-2">
                          Erro: {errorMessage}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {post.status_global === 'failed' && attempts < 3 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => retryPost.mutate(post.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Tentar novamente
                          </Button>
                        )}
                        
                        {providerUrl && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            asChild
                          >
                            <a href={providerUrl} target="_blank" rel="noopener noreferrer">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
