import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSocialPosts, STATUS_LABELS, STATUS_COLORS, SocialPostStatus } from "@/hooks/useSocialPosts";
import { PLATFORM_LABELS, PLATFORM_ICONS, SocialPlatform } from "@/hooks/useSocialAccounts";
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  ExternalLink,
  Clock,
  Image as ImageIcon 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SocialQueue() {
  const [statusFilter, setStatusFilter] = useState<SocialPostStatus[]>(['queued', 'needs_review']);
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | undefined>(undefined);
  
  const { 
    posts, 
    isLoading, 
    approvePost, 
    cancelPost, 
    retryPost 
  } = useSocialPosts({ 
    status: statusFilter,
    platform: platformFilter,
    limit: 100 
  });

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'queue':
        setStatusFilter(['queued', 'needs_review']);
        break;
      case 'review':
        setStatusFilter(['needs_review']);
        break;
      case 'processing':
        setStatusFilter(['posting']);
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

      <Tabs defaultValue="queue" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="queue">Na Fila</TabsTrigger>
          <TabsTrigger value="review">Aguardando Revisão</TabsTrigger>
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

        <TabsContent value="review" className="mt-4">
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
  posts: ReturnType<typeof useSocialPosts>['posts'];
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
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Image */}
              <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                {post.payload?.image ? (
                  <img 
                    src={post.payload.image} 
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
                  
                  {post.scheduled_at && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(post.scheduled_at), "dd/MM HH:mm")}
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {post.payload?.custom_caption ?? post.payload?.title}
                </p>

                {post.error_message && (
                  <p className="text-sm text-destructive mt-2">
                    Erro: {post.error_message}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  {post.status === 'needs_review' && (
                    <Button 
                      size="sm" 
                      onClick={() => onApprove(post.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                  )}
                  
                  {post.status === 'failed' && post.retries_count < 3 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onRetry(post.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Tentar novamente
                    </Button>
                  )}
                  
                  {['queued', 'needs_review'].includes(post.status) && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onCancel(post.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
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
  );
}
