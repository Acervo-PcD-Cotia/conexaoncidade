import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Send,
  ChevronDown,
  ChevronUp,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NestedComments } from "./NestedComments";

interface Post {
  id: string;
  author_id: string;
  content: string;
  post_type: string;
  like_count: number;
  comment_count: number;
  view_count: number;
  is_pinned: boolean;
  is_official: boolean;
  pin_order: number;
  created_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const POST_SUGGESTIONS = [
  "O que precisa melhorar na sua cidade?",
  "Você já identificou uma fake news hoje?",
  "Qual tema você quer ver mais no portal?",
  "Compartilhe algo positivo da sua comunidade!",
  "Qual iniciativa local merece destaque?",
  "O que você aprendeu recentemente que vale compartilhar?",
  "Qual é o maior desafio da sua região?",
];

export function CommunityFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Random suggestion
  const suggestion = useMemo(() => {
    return POST_SUGGESTIONS[Math.floor(Math.random() * POST_SUGGESTIONS.length)];
  }, []);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*, is_pinned, is_official, pin_order')
        .eq('is_hidden', false)
        .order('is_pinned', { ascending: false })
        .order('pin_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      // Fetch author profiles
      const authorIds = [...new Set(data.map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(post => ({
        ...post,
        author: profileMap.get(post.author_id) || null,
      })) as Post[];
    },
  });

  // Realtime subscription for new posts
  useEffect(() => {
    const channel = supabase
      .channel('community-posts-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          author_id: user.id,
          content,
          post_type: 'discussion',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      setNewPost("");
      setIsPosting(false);
      toast({
        title: 'Publicado! +10 pontos 🎉',
        description: 'Sua publicação foi enviada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    },
  });

  const handlePost = () => {
    if (newPost.trim()) {
      createPostMutation.mutate(newPost.trim());
    }
  };

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="space-y-4">
      {/* New Post */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              {isPosting ? (
                <>
                  <Textarea
                    placeholder={suggestion}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setIsPosting(false);
                        setNewPost("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handlePost}
                      disabled={!newPost.trim() || createPostMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Publicar
                    </Button>
                  </div>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => setIsPosting(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {suggestion}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando publicações...
        </div>
      ) : posts?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Nenhuma publicação ainda</h3>
            <p className="text-sm text-muted-foreground">
              Seja o primeiro a compartilhar algo com a comunidade!
            </p>
          </CardContent>
        </Card>
      ) : (
        posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Check if already liked
      const { data: existing } = await supabase
        .from('community_reactions')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        // Unlike
        await supabase
          .from('community_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Like
        await supabase
          .from('community_reactions')
          .insert({
            post_id: post.id,
            user_id: user.id,
            reaction_type: 'like',
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    },
  });

  const initials = post.author?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  // Highlight @mentions in content
  const renderContent = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="text-primary font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const isOfficial = post.is_official;
  const isPinned = post.is_pinned && !post.is_official;

  return (
    <Card className={isOfficial ? "border-primary/30 bg-primary/5" : isPinned ? "border-yellow-200 dark:border-yellow-800" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url || undefined} />
              <AvatarFallback className={isOfficial ? "bg-primary text-primary-foreground" : "bg-muted"}>
                {isOfficial ? <Shield className="h-5 w-5" /> : initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">
                  {isOfficial ? 'Conexão na Cidade' : post.author?.full_name || 'Membro da Comunidade'}
                </p>
                {isOfficial && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs py-0">
                    <Shield className="h-3 w-3 mr-1" />
                    Oficial
                  </Badge>
                )}
                {isPinned && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs py-0">
                    📌 Fixado
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </p>
            </div>
          </div>
          {!isOfficial && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
          {renderContent(post.content)}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t flex-col items-stretch gap-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => toggleLikeMutation.mutate()}
          >
            <Heart className="h-4 w-4" />
            {post.like_count > 0 && <span>{post.like_count}</span>}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            {post.comment_count > 0 && <span>{post.comment_count}</span>}
            {showComments ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Nested Comments */}
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleContent>
            <NestedComments postId={post.id} />
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  );
}
