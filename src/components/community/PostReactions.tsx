import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, ThumbsUp, Hand, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const REACTION_TYPES = [
  { type: "like", icon: Heart, label: "Curtir", color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-900/20" },
  { type: "helped", icon: ThumbsUp, label: "Me ajudou", color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-900/20" },
  { type: "interested", icon: Hand, label: "Quero participar", color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  { type: "inspiring", icon: Sparkles, label: "Inspirador", color: "text-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
];

interface PostReactionsProps {
  postId: string;
  compact?: boolean;
}

export function PostReactions({ postId, compact = false }: PostReactionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAll, setShowAll] = useState(false);

  // Fetch reactions for this post
  const { data: reactions } = useQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_reactions')
        .select('reaction_type, user_id')
        .eq('post_id', postId);
      
      if (error) throw error;
      return data;
    },
  });

  // Get user's current reaction
  const userReaction = reactions?.find(r => r.user_id === user?.id)?.reaction_type;

  // Count reactions by type
  const reactionCounts = REACTION_TYPES.reduce((acc, { type }) => {
    acc[type] = reactions?.filter(r => r.reaction_type === type).length || 0;
    return acc;
  }, {} as Record<string, number>);

  const toggleReactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Check if user already has this reaction
      const { data: existing } = await supabase
        .from('community_reactions')
        .select('id, reaction_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        if (existing.reaction_type === reactionType) {
          // Remove reaction
          await supabase
            .from('community_reactions')
            .delete()
            .eq('id', existing.id);
        } else {
          // Update reaction
          await supabase
            .from('community_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existing.id);
        }
      } else {
        // Add new reaction
        await supabase
          .from('community_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
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

  const visibleReactions = showAll ? REACTION_TYPES : REACTION_TYPES.slice(0, compact ? 2 : 4);
  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleReactions.map(({ type, icon: Icon, label, color, bgColor }) => {
        const count = reactionCounts[type];
        const isActive = userReaction === type;

        return (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1 h-8 px-2",
              isActive && bgColor
            )}
            onClick={() => toggleReactionMutation.mutate(type)}
            disabled={toggleReactionMutation.isPending}
            title={label}
          >
            <Icon className={cn("h-4 w-4", isActive ? color : "text-muted-foreground")} />
            {count > 0 && <span className="text-xs">{count}</span>}
          </Button>
        );
      })}

      {compact && !showAll && REACTION_TYPES.length > 2 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground"
          onClick={() => setShowAll(true)}
        >
          +{REACTION_TYPES.length - 2}
        </Button>
      )}
    </div>
  );
}
