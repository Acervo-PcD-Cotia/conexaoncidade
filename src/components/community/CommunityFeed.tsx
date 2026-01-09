import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  author_id: string;
  content: string;
  post_type: string;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export function CommunityFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as Post[];
    },
  });

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
        title: 'Publicado!',
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
                    placeholder="O que você gostaria de compartilhar com a comunidade?"
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
                  Criar publicação...
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted">
                U
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">Membro da Comunidade</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="pt-2 border-t">
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
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            {post.comment_count > 0 && <span>{post.comment_count}</span>}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
