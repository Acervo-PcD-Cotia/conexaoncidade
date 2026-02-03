import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  ExternalLink,
  Clock,
  Image as ImageIcon 
} from "lucide-react";
import { format } from "date-fns";

export default function SocialQueue() {
  const [statusFilter, setStatusFilter] = useState<PostGlobalStatus[]>(['scheduled']);
  const [originFilter, setOriginFilter] = useState<SocialPost['origin_type'] | undefined>(undefined);
  
  const { 
    posts, 
    isLoading, 
    approvePost, 
    cancelPost, 
    retryPost 
  } = useSocialPosts({ 
    status: statusFilter,
    originType: originFilter,
    limit: 100 
  });

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'queue':
        setStatusFilter(['scheduled']);
        break;
      case 'draft':
        setStatusFilter(['draft']);
        break;
      case 'processing':
        setStatusFilter(['processing']);
        break;
      case 'failed':
        setStatusFilter(['failed']);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fila de Publicação</h1>
        <p className="text-muted-foreground">
          Gerencie posts aguardando publicação nas redes sociais
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

      <Tabs defaultValue="queue" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="queue">Agendados</TabsTrigger>
          <TabsTrigger value="draft">Rascunhos</TabsTrigger>
          <TabsTrigger value="processing">Processando</TabsTrigger>
          <TabsTrigger value="failed">Falhas</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <PostList 
            posts={posts} 
            isLoading={isLoading}
            onApprove={(id) => approvePost.mutate(id)}
            onCancel={(id) => cancelPost.mutate(id)}
            onRetry={(id) => retryPost.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="draft" className="mt-4">
          <PostList 
            posts={posts} 
            isLoading={isLoading}
            onApprove={(id) => approvePost.mutate(id)}
            onCancel={(id) => cancelPost.mutate(id)}
            onRetry={(id) => retryPost.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="processing" className="mt-4">
          <PostList 
            posts={posts} 
            isLoading={isLoading}
            onApprove={(id) => approvePost.mutate(id)}
            onCancel={(id) => cancelPost.mutate(id)}
            onRetry={(id) => retryPost.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="failed" className="mt-4">
          <PostList 
            posts={posts} 
            isLoading={isLoading}
            onApprove={(id) => approvePost.mutate(id)}
            onCancel={(id) => cancelPost.mutate(id)}
            onRetry={(id) => retryPost.mutate(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PostList({ 
  posts, 
  isLoading,
  onApprove,
  onCancel,
  onRetry,
}: { 
  posts: SocialPost[] | undefined;
  isLoading: boolean;
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Carregando...</p>;
  }

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum post encontrado
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const firstTarget = post.targets?.[0];
        const platform = firstTarget?.social_account?.platform;
        const scheduledAt = firstTarget?.scheduled_at;
        const providerUrl = firstTarget?.provider_post_url;
        const errorMessage = firstTarget?.error_message;
        const attempts = firstTarget?.attempts ?? 0;
        const media = post.media_json?.[0];
        
        return (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  {media?.url ? (
                    <img 
                      src={media.url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
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
                    
                    {scheduledAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(scheduledAt), "dd/MM HH:mm")}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {post.base_caption ?? post.title}
                  </p>

                  {errorMessage && (
                    <p className="text-sm text-destructive mt-2">
                      Erro: {errorMessage}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {post.status_global === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => onApprove(post.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                    )}
                    
                    {post.status_global === 'failed' && attempts < 3 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onRetry(post.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Tentar novamente
                      </Button>
                    )}
                    
                    {['scheduled', 'draft'].includes(post.status_global) && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onCancel(post.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
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
  );
}
