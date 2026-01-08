import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserInvite {
  id: string;
  email: string;
  invited_by: string | null;
  role: string;
  status: string;
  token: string | null;
  created_at: string;
  accepted_at: string | null;
  expires_at: string | null;
  inviter?: {
    full_name: string | null;
  };
}

export function useUserInvites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invites, isLoading } = useQuery({
    queryKey: ["user-invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserInvite[];
    },
  });

  const createInvite = useMutation({
    mutationFn: async ({ 
      email, 
      role 
    }: { 
      email: string; 
      role: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("user_invites")
        .insert({
          email,
          role,
          invited_by: user?.id,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invites"] });
      toast({
        title: "Convite criado",
        description: "O convite foi registrado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  const resendInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { data, error } = await supabase
        .from("user_invites")
        .update({
          status: "pending",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", inviteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invites"] });
      toast({
        title: "Convite reenviado",
        description: "O convite foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  const deleteInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from("user_invites")
        .delete()
        .eq("id", inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invites"] });
      toast({
        title: "Convite removido",
        description: "O convite foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  return {
    invites,
    isLoading,
    createInvite,
    resendInvite,
    deleteInvite,
  };
}
