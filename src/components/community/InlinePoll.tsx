import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PollOption {
  text: string;
}

interface InlinePollProps {
  pollId: string;
  question: string;
  options: PollOption[];
  endsAt?: string | null;
  allowMultiple?: boolean;
}

export function InlinePoll({ pollId, question, options, endsAt, allowMultiple = false }: InlinePollProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const isExpired = endsAt ? new Date(endsAt) < new Date() : false;

  // Fetch votes
  const { data: votes } = useQuery({
    queryKey: ['poll-votes', pollId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_poll_votes' as any)
        .select('option_index, user_id')
        .eq('poll_id', pollId);
      
      if (error) throw error;
      return (data || []) as unknown as { option_index: number; user_id: string }[];
    },
  });

  // Check if user already voted
  const userVotes = votes?.filter(v => v.user_id === user?.id).map(v => v.option_index) || [];
  const hasVoted = userVotes.length > 0;
  const totalVotes = votes?.length || 0;

  // Calculate vote counts per option
  const voteCounts = options.map((_, index) => 
    votes?.filter(v => v.option_index === index).length || 0
  );

  const voteMutation = useMutation({
    mutationFn: async (optionIndices: number[]) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Delete existing votes if re-voting
      await supabase
        .from('community_poll_votes' as any)
        .delete()
        .eq('poll_id', pollId)
        .eq('user_id', user.id);
      
      // Insert new votes
      const votes = optionIndices.map(index => ({
        poll_id: pollId,
        user_id: user.id,
        option_index: index,
      }));
      
      const { error } = await supabase
        .from('community_poll_votes' as any)
        .insert(votes);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll-votes', pollId] });
      setSelectedOptions([]);
      toast({
        title: 'Voto registrado! +5 pontos 🎉',
        description: 'Obrigado por participar da enquete.',
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

  const handleOptionClick = (index: number) => {
    if (hasVoted || isExpired) return;
    
    if (allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedOptions([index]);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Selecione uma opção',
        description: 'Você precisa selecionar ao menos uma opção para votar.',
      });
      return;
    }
    voteMutation.mutate(selectedOptions);
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-pink-600" />
          <h4 className="font-semibold text-sm">{question}</h4>
        </div>
        {isExpired && (
          <Badge variant="secondary" className="text-xs">Encerrada</Badge>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option, index) => {
          const voteCount = voteCounts[index];
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = selectedOptions.includes(index);
          const isUserVote = userVotes.includes(index);

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={hasVoted || isExpired}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden",
                hasVoted || isExpired
                  ? "cursor-default"
                  : "hover:border-pink-300 cursor-pointer",
                isSelected && "border-pink-500 bg-pink-50 dark:bg-pink-900/20",
                isUserVote && "border-pink-600"
              )}
            >
              {(hasVoted || isExpired) && (
                <div 
                  className="absolute inset-0 bg-pink-100 dark:bg-pink-900/30 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isUserVote && <Check className="h-4 w-4 text-pink-600" />}
                  <span className="text-sm">{option.text}</span>
                </div>
                {(hasVoted || isExpired) && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}</span>
        </div>
        
        {!hasVoted && !isExpired && selectedOptions.length > 0 && (
          <Button 
            size="sm" 
            onClick={handleVote}
            disabled={voteMutation.isPending}
            className="bg-pink-600 hover:bg-pink-700"
          >
            Votar
          </Button>
        )}
      </div>
    </div>
  );
}
